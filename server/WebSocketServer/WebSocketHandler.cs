using System;
using System.Net.WebSockets;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;

namespace WebSocketServer
{
    public class WebSocketHandler
    {
        
        private static readonly SemaphoreSlim Lock = new SemaphoreSlim(1);


        private readonly Person _personTemplate;
        private WebSocket _webSocket;

        public WebSocketHandler()
        {
            _personTemplate = new Person {FirstName = "John", LastName = "Smith", Id = 1};
        }


        public async Task InitRunLoop(WebSocket webSocket)
        {
            StartPingLoop();

            var buffer = new byte[1024 * 4];
            
            _webSocket = webSocket;

            async Task<WebSocketReceiveResult> WaitForNext()
            {
                return await _webSocket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);
            }

            var result = await WaitForNext();


            while (!result.CloseStatus.HasValue)
            {
                var message = Encoding.ASCII.GetString(buffer, 0, result.Count);

                if (Convert<PersonTemplateRequest>(message) is { } personTemplate)
                {
                    await HandlePersonTemplate(_webSocket, personTemplate);
                }
                else if (Convert<PersonRequest>(message) is { } person)
                {
                    HandlePerson(person);
                }

                result = await WaitForNext();
            }

            await _webSocket.CloseAsync(result.CloseStatus.Value, result.CloseStatusDescription, CancellationToken.None);
        }

        // try to convert the message to known types
        private T Convert<T>(string message) where T: class
        {
            try
            {
                var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase};

                if (message.Contains("personsTemplate")) return JsonSerializer.Deserialize<PersonTemplateRequest>(message, options) as T;
                if (message.Contains("persons")) return JsonSerializer.Deserialize<PersonRequest>(message, options) as T;

                return default;
            }
            catch (Exception)
            {
                return default;
            }
        }

        private async Task<bool> HandlePersonTemplate(WebSocket webSocket, PersonTemplateRequest template)
        {
            if (template?.Payload == null) return false;

            try
            {
                await Lock.WaitAsync();

                var (firstName, lastName) = template;

                _personTemplate.FirstName = firstName ?? _personTemplate.FirstName;
                _personTemplate.LastName = lastName ?? _personTemplate.LastName;

                // will ping back the new template to the client over web socket
                var response = new PersonTemplateResponse { Payload = _personTemplate };
                return await SendMessage(response);
            }
            finally
            {
                Lock.Release();
            }
        }

        private bool HandlePerson(PersonRequest person)
        {
            // for now, do nothing in these cases
            return true;
        }

        private async Task<bool> SendMessage<T>(T message)
        {
            var options = new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                WriteIndented = true
            };

            var buffer = new ArraySegment<byte>(Encoding.UTF8.GetBytes(JsonSerializer.Serialize(message, options)));
            await _webSocket.SendAsync(buffer, WebSocketMessageType.Text, true, CancellationToken.None);

            return true;
        }

        // just sending some content to the client on a given frequency
        private void StartPingLoop()
        {
            Task.Run(async () =>
            {
                for (var i = 0; i < 100; i++)
                {
                    Person person;

                    await Lock.WaitAsync();

                    try
                    {
                        person = Person.Create(_personTemplate.FirstName, $"{_personTemplate.LastName} the {i}.th");
                    }
                    finally
                    {
                        Lock.Release();
                    }
                    
                    await SendMessage(new PersonRequest { Payload = person });
                    await Task.Delay(1000);
                }
            }).ConfigureAwait(false);
        }


        /* this class is made ngrx/data friendly which has such a structure:
            export interface UpdateNum<T> {
                id: number;
                changes: Partial<T>;    // where T is of type Person
            } 
        */
        private class PersonTemplateRequest
        {
            public string Type { get; set; }
            public PersonTemplatePayload Payload { get; set; }

            public void Deconstruct(out string firstName, out string lastName)
            {
                firstName = Payload?.Changes?.FirstName;
                lastName = Payload?.Changes?.LastName;
            }
        }

        private class PersonTemplatePayload
        {
            public int Id { get; set; }
            public Person Changes { get; set; }
        }

        private class PersonTemplateResponse
        {
            public string Type { get; set; } = "personsTemplate";
            public Person Payload{ get; set; }
        }


        private class PersonRequest
        {
            public string Type { get; set; } = "persons";
            public Person Payload { get; set; }
        }

        
        
    }
}