using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.WebSockets;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Backend
{
    public class WorldState
    {
        List<Player> playerList = new List<Player>();


        public async Task AddPlayer(WebSocket socket)
        {
            var newPlayer = new Player(socket);
            playerList.Add(newPlayer);

            await Echo(newPlayer);
           // Thread t = new Thread(new ParameterizedThreadStart(async (p) => { await Echo((Player)p); }));
            //t.Start(newPlayer);
            
        }


        private async Task Echo(Player player)
        {
            WebSocket webSocket = player.Socket;

            var buffer = new byte[1024 * 4];
            var cleaningBuffer = new byte[1024 * 4];
            WebSocketReceiveResult result = await webSocket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);
            var str = System.Text.Encoding.Default.GetString(buffer);
            
            var playerPosition = JsonConvert.DeserializeObject<Player>(str);
            player.x = playerPosition.x;
            player.y = playerPosition.y;
            
            Thread t = new Thread(new ParameterizedThreadStart(async (p) => { await SendWorldState((Player)p); }));
            t.Start(player);

            while (!result.CloseStatus.HasValue)
            {
                try
                {
                    result = await webSocket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);
                }
                catch(Exception e)
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
                player.x = playerPosition.x;
                player.y = playerPosition.y;
                cleaningBuffer.CopyTo(buffer, 0);
            }
            //await webSocket.CloseAsync(result.CloseStatus.Value, result.CloseStatusDescription, CancellationToken.None);
            
        }

        private async Task SendWorldState(Player player)
        {
            WebSocket webSocket = player.Socket;

            while (!webSocket.CloseStatus.HasValue)
            {
                var tempPlayerList = new Player[10];
                playerList.CopyTo(tempPlayerList);
                var currentGameState = JsonConvert.SerializeObject(
                    tempPlayerList
                    .Where(p => p != player && p != null)
                    .Select(p => new { x = p.x, y=p.y })
                );
                var bytes = Encoding.UTF8.GetBytes(currentGameState);
                try
                {
                    await webSocket.SendAsync(new ArraySegment<byte>(bytes, 0, bytes.Length), WebSocketMessageType.Text, true, CancellationToken.None);
                }
                catch(Exception e)
                {
                    break;
                }
                
                Thread.Sleep(15);
            }
            playerList.Remove(player);
        }
    }

}
