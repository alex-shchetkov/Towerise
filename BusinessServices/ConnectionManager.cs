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
        private WorldState _world;
        private SocketManager _socketManager;

        public ConnectionManager(WorldState world)
        {
            _world = world;
            world.WorldUpdated += World_WorldUpdated;

            _socketManager = new SocketManager();
        }

        private void World_WorldUpdated(object sender, EventArgs e)
        {
            var listOfPlayersToNotify = (List<Player>) sender;

            UpdatePlayers(listOfPlayersToNotify);

        }

        public async Task NewConnection(WebSocket socket)
        {
            Player newPlayer;
            try
            {

                //Receive The first message from client, like a name, and send back a guid
                newPlayer = await GetPlayerInfo(socket);
            }
            catch (Exception e)
            {
                Console.Error.WriteLine("handshake failed" + e.Message);
                return ;
            }


            //Begin worldstate exchange with player
            SendInitialWorldState(socket, newPlayer);

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


        private void SendInitialWorldState(WebSocket socket, Player player)
        {
            try
            {
                socket.SendData(player.CurrentCell.AdjacentCells);
            }
            catch (Exception e)
            {
                Console.WriteLine("exception in SendInitialWorldState: "+e.Message);
            }
             
        }

        private async Task ListenForPlayerActions(WebSocket socket, Player player)
        {
            try
            {
                while (socket.State==WebSocketState.Open)
                {
                    var action = await socket.GetData<PlayerAction>();
                    action.Player = player;
                    WorldState.ProcessAction(action);
                }
            }
            catch (Exception e)
            {
                Console.WriteLine("exception: "+e.Message);
                player.OnPlayerDisconnected();
            }
            
            
        }

        public void UpdatePlayers(List<Player> playersToUpdate)
        {
            try
            {
                var tasks = new List<Task>();
                foreach (var player in playersToUpdate)
                {
                    tasks.Add(Task.Factory.StartNew(() =>
                        _socketManager.SendData(player, player.CurrentCell.AdjacentCells)));
                }
                Task.WaitAll(tasks.ToArray());
            }
            catch (Exception e)
            {
                Console.WriteLine("exception in UpdatePlayers: " + e.Message);
                
            }
            
        }
        
    }
}
