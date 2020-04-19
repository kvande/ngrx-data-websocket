using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;


namespace WebSocketServer
{
    public class Startup
    {
        private WebSocketHandler _webSocketHandler;
        private static SemaphoreSlim Lock = new SemaphoreSlim(1);



        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        public void ConfigureServices(IServiceCollection services)
        {
            services.AddControllers();
        }

        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            var webSocketOptions = new WebSocketOptions()
            {
                KeepAliveInterval = TimeSpan.FromSeconds(12000),    // mega large so that is to not close
                ReceiveBufferSize = 4 * 1024
            };

            app.UseWebSockets(webSocketOptions);

            // it`s all open
            app.UseCors(i =>
                     i.AllowAnyHeader()
                      .AllowAnyMethod()
                      .AllowAnyOrigin());


            app.Use(async (context, next) =>
            {
                if (context.Request.Path == "/ws")
                {
                    if (context.WebSockets.IsWebSocketRequest)
                    {
                        await InitWebSocketHandler(context);
                    }
                    else
                    {
                        context.Response.StatusCode = 400;
                    }
                }
                else
                {
                    await next();
                }
            });

            app.UseRouting();
            app.UseAuthorization();
            app.UseEndpoints(endpoints => { endpoints.MapControllers(); });

        }

        // on first web socket request; spin ut the web socket handler, should not create more than one in THIS test app(!)
        private async Task InitWebSocketHandler(HttpContext context)
        {
            try
            {
                await Lock.WaitAsync();
                
                var webSocket = await context.WebSockets.AcceptWebSocketAsync();
                _webSocketHandler = new WebSocketHandler();

                await _webSocketHandler.InitRunLoop(webSocket);
            }
            finally
            {
                Lock.Release();
            }
        }

    }
}
