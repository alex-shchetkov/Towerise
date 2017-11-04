using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.WebSockets;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Backend;
using BusinessServices.NetworkModel;
using Model.BackendModel;
using Model.NetworkModel;
using Newtonsoft.Json;

namespace BusinessServices
{
    public class ConnectionManager
    {
        public ConnectionManager(WorldState world)
        {
            world.WorldUpdated += World_WorldUpdated;
        }

        private void World_WorldUpdated(object sender, EventArgs e)
        {
            var listOfPlayersToNotify = (List<Player>) sender;

            UpdatePlayers(listOfPlayersToNotify);

        }

        public async Task NewConnection(WebSocket socket)
        {
            

            //Receive The first message from client, like a name, and send back a guid
            var newPlayer = await GetPlayerInfo(socket);


            //Begin worldstate exchange with player
            await SendInitialWorldState(socket, newPlayer);

            await ListenForPlayerActions(socket, newPlayer);

            //await Echo(newPlayer, socket);

        }

        private async Task<Player> GetPlayerInfo(WebSocket socket)
        {
            var newPlayerHandshake = await socket.GetData<PlayerHandshake>();
            
            newPlayerHandshake.PlayerConnectionId = Guid.NewGuid();
            newPlayerHandshake.Socket = socket;

            //await socket.SendData(newPlayerHandshake);

            //handshake successful, create the player
            return WorldState.Instance.AddPlayer(newPlayerHandshake);
            
        }


        private async Task SendInitialWorldState(WebSocket socket, Player player)
        {
            await socket.SendData(player.CurrentCell.AdjacentCells);
        }

        private async Task ListenForPlayerActions(WebSocket socket, Player player)
        {
            while (!socket.CloseStatus.HasValue)
            {
                var action = await socket.GetData<PlayerAction>();
                action.Player = player;
                WorldState.ProcessAction(action);
            }
            
        }

        public void UpdatePlayers(List<Player> playersToUpdate)
        {
            var tasks = new List<Task>();
            foreach (var player in playersToUpdate)
            {
                tasks.Add(player.Socket.SendData(player.CurrentCell.AdjacentCells));
            }
            Task.WaitAll(tasks.ToArray());
        }
    }
}
