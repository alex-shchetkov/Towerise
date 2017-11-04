using System;
using System.Net.WebSockets;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Newtonsoft.Json;

namespace BusinessServices
{
    public static class WebSocketExtensionMethods
    {
        public static async Task SendData<T>(this WebSocket socket, T data)
        {
            var bytes = Encoding.UTF8.GetBytes(JsonConvert.SerializeObject(data));
            await socket.SendAsync(new ArraySegment<byte>(bytes, 0, bytes.Length), WebSocketMessageType.Text, true, CancellationToken.None);
        }

        public static async Task<T> GetData<T>(this WebSocket socket)
        {
            var buffer = new byte[1024 * 4];
            WebSocketReceiveResult result = await socket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);
            var str = System.Text.Encoding.Default.GetString(buffer);
            return JsonConvert.DeserializeObject<T>(str);

            
        }
    }
}