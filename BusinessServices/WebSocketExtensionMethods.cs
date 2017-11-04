using System;
using System.Collections.Generic;
using System.Net.WebSockets;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Newtonsoft.Json;

namespace BusinessServices
{
    public static class WebSocketExtensionMethods
    {
        public static void SendData<T>(this WebSocket socket, T data)
        {
            var bytes = Encoding.UTF8.GetBytes(JsonConvert.SerializeObject(data));
            if (bytes.Length > 4096) throw new Exception("message sent is too large");
            socket.SendAsync(new ArraySegment<byte>(bytes, 0, bytes.Length), WebSocketMessageType.Text, true, CancellationToken.None);
        }

        public static async Task<T> GetData<T>(this WebSocket socket)
        {
            try
            {
                var buffer = new byte[1024 * 4];
                WebSocketReceiveResult result =
                    await socket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);
                var str = System.Text.Encoding.Default.GetString(buffer);
                return JsonConvert.DeserializeObject<T>(str);
            }
            catch(Exception e)
            {
                Console.Error.WriteLine("GetData messed up: "+ e.Message);
                throw;
            }
                

        }
    }
}