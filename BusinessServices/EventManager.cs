using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Net.WebSockets;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Model.BackendModel;
using Newtonsoft.Json;

namespace BusinessServices
{
    /// <summary>
    /// Event manager has 2 sources of events, the movement and action events coming from ConnectionManager
    /// and pretty much every other action that other managers detect (like rock manager detecting one of the rocks broke)
    /// </summary>
    public class EventManager
    {
        public ConcurrentQueue<Action> Events, OutgoingEvents;
        public SocketManager _socketManager;

        public EventManager(SocketManager socketManager)
        {
            Events = new ConcurrentQueue<Action>();
            OutgoingEvents = new ConcurrentQueue<Action>();
            _socketManager = socketManager;

            Task.Factory.StartNew(BeginProcessingIncomingEvents);
            //Task.Factory.StartNew(BeginProcessingOutgoingEvents);
        }

        public void AddEvent(Action action)
        {
            Events.Enqueue(action);


        }

        public void AddOutgoingEvent(Action action)
        {
            OutgoingEvents.Enqueue(action);


        }



        public void BeginProcessingIncomingEvents()
        {
            while (true)
            {
                while (!Events.IsEmpty)
                {
                    try
                    {
                        Action cEvent = null;
                        Events.TryDequeue(out cEvent);
                        if (cEvent != null)
                        {
                            cEvent.Invoke();
                            
                        }
                        else continue;

                    }
                    catch (Exception e)
                    {
                        Console.WriteLine(e.Message);
                        Console.WriteLine(e.StackTrace);
                    }
                }
                
                RefreshAllPlayers();
                Thread.Sleep(56);
            }
            
        }

        public void BeginProcessingOutgoingEvents()
        {
            while (true)
            {
                while (!OutgoingEvents.IsEmpty)
                {
                    try
                    {
                        /*Action cEvent = null;
                        OutgoingEvents.TryDequeue(out cEvent);
                        if (cEvent != null)
                        {
                            cEvent.Invoke();
                        }
                        else break;*/

                        
                    }
                    catch (Exception e)
                    {
                        Console.WriteLine(e.Message);
                        Console.WriteLine(e.StackTrace);
                    }
                }
                Thread.Sleep(17);
            }

        }

        public void RefreshAllPlayers()
        {
            var tasks = new List<Task>();
            //List<KeyValuePair<Player, byte[]>> listOfUpdates = new List<KeyValuePair<Player, byte[]>>();
            if (PlayerManager.Instance.Players.Count==0) return;
            foreach (var player in PlayerManager.Instance.Players)
            {
                if (player.Socket.State == WebSocketState.Open)
                    tasks.Add(Task.Factory.StartNew(() =>
                        player.Socket.SendData(
                            Encoding.UTF8.GetBytes(JsonConvert.SerializeObject(player.CurrentCell.AdjacentCells)))));
                else
                {
                    AddEvent(() =>PlayerManager.Instance.Players.Remove(player));
                }
            }

        }

        //Might need to make a copy of the cell state
        public void AddRefreshEvent(GridCell[] updatedCells, Player[] affectedPlayers)
        {
            var updatedCellData =Encoding.UTF8.GetBytes(JsonConvert.SerializeObject(updatedCells));
            var tasks = new List<Task>();
            foreach (var updatedCell in updatedCells)
            {
                
                    foreach (var player in updatedCell.Players)
                    {

                        tasks.Add(Task.Factory.StartNew(() =>
                            player.Socket.SendData(updatedCellData)));
                    }
                
                
            }
        }
    }
}