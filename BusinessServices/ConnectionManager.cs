using System;
using System.Linq;
using System.Net.WebSockets;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Backend;
using Newtonsoft.Json;

namespace BusinessServices
{
    public class ConnectionManager
    {


        public async Task NewConnection(WebSocket socket)
        {
            
            var newPlayer = WorldState.Instance.AddPlayer();


            await Echo(newPlayer, socket);

        }


        private async Task Echo(Player player, WebSocket webSocket)
        {

            var buffer = new byte[1024 * 4];
            WebSocketReceiveResult result = await webSocket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);
            var str = System.Text.Encoding.Default.GetString(buffer);

            var playerPosition = JsonConvert.DeserializeObject<Player>(str);
            player.X = playerPosition.X;
            player.Y = playerPosition.Y;

            Thread t = new Thread(new ParameterizedThreadStart(async (p) => { await SendWorldState((Player)p, webSocket); }));
            t.Start(player);

            while (!result.CloseStatus.HasValue)
            {
                try
                {
                    result = await webSocket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);
                }
                catch (Exception e)
                {
                    break;
                }


                str = System.Text.Encoding.Default.GetString(buffer);
                try
                {
                    playerPosition = JsonConvert.DeserializeObject<Player>(str);
                }
                catch (Exception e)
                {
                    //eat it
                }
                player.X = playerPosition.X;
                player.Y = playerPosition.Y;
            }
            //await webSocket.CloseAsync(result.CloseStatus.Value, result.CloseStatusDescription, CancellationToken.None);

        }

        private async Task SendWorldState(Player player, WebSocket webSocket)
        {

            while (!webSocket.CloseStatus.HasValue)
            {
                var tempList = new Player[WorldState.Instance.PlayerList.Count];
                WorldState.Instance.PlayerList.CopyTo(tempList);

                var currentGameState = JsonConvert.SerializeObject(tempList.Where(p=>p!=player));
                var bytes = Encoding.UTF8.GetBytes(currentGameState);
                try
                {
                    await webSocket.SendAsync(new ArraySegment<byte>(bytes, 0, bytes.Length), WebSocketMessageType.Text, true, CancellationToken.None);
                }
                catch (Exception e)
                {
                    break;
                }

                Thread.Sleep(15);
            }
            WorldState.Instance.PlayerList.Remove(player);
        }





    }
}
