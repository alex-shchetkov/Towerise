using System;
using System.Collections.Generic;
using System.Net.WebSockets;
using System.Threading.Tasks;
using Model.BackendModel;

namespace BusinessServices
{
    public class SocketManager
    {
        private Dictionary<WebSocket, List<Task>> _socketTasks;

        public SocketManager()
        {
            _socketTasks = new Dictionary<WebSocket, List<Task>>();
        }

        public void SendData<T>(Player player, T data)
        {
            try
            {
                player.Socket.SendData(data);
            }
            catch (Exception e)
            {
                Console.WriteLine("Player dc'ed during update: " + e.Message);
                player.OnPlayerDisconnected();
            }



            /*if (!_socketTasks.ContainsKey(player.Socket))_socketTasks.Add(player.Socket, new List<Task>());

            _socketTasks[player.Socket].Add(new Task<WebSocketState>(()=> QueueTask(player, data)));
            _socketTasks[player.Socket][0].Start();*/
        }

        /*private WebSocketState QueueTask<T>(Player player, T data)
        {
            
            try
            {
                return player.Socket.SendData(data).Result;
            }
            catch (Exception e)
            {
                Console.WriteLine("Player dc'ed during update: " + e.Message);
                player.OnPlayerDisconnected();
                return player.Socket.State;
            }
        }*/
    }
}