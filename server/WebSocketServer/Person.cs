namespace WebSocketServer
{
    public class Person
    {
        public int Id { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }

        private static int _id;


        public static Person Create(string firstName, string lastName)
        {
            return new Person
            {
                Id = ++_id,
                FirstName = firstName,
                LastName = lastName
            };
        }
      
    }
}