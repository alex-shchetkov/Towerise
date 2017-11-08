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

        public static void SendData(this WebSocket socket, byte[] data)
        {
            if (data.Length > 4096) throw new Exception("message sent is too large");
            socket.SendAsync(new ArraySegment<byte>(data, 0, data.Length), WebSocketMessageType.Text, true, CancellationToken.None);
        }

        public static async Task<T> GetData<T>(this WebSocket socket)
        {
            string str = null;
            try
            {
                var buffer = new byte[1024 * 4];
                WebSocketReceiveResult result =
                    await socket.ReceiveAsync(new ArraySegment<byte>(buffer), new CancellationToken(false));
                if (!result.EndOfMessage || result.CloseStatus.HasValue || result.CloseStatusDescription != null)
                {
                    Console.WriteLine("lets check it out");
                }
                str = System.Text.Encoding.Default.GetString(buffer);
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