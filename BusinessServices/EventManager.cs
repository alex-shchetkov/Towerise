﻿using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Diagnostics;
using System.Net.WebSockets;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Backend;
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
        private const int _msPerSimTick = 31; //this is around 32 times per second
        private const int _msPerSnapshotTick = 50; //this is 20 times per second



        public int CurrentSimTick = 0;


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


        
        private int _leftOverSimMs = 0;
        private int _leftOverSnapshotMs = 0;
        private Stopwatch _stopwatch;

        public async Task BeginProcessingIncomingEvents()
        {
            _stopwatch = new Stopwatch();
            _stopwatch.Start();
            while (true)
            {
                
                

                


                if (_leftOverSimMs > _msPerSimTick)
                {
                    _leftOverSimMs = _leftOverSimMs % _msPerSimTick;
                    CurrentSimTick++;
                    //Console.WriteLine(CurrentSimTick);
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

                    PlayerManager.Instance.GameSimTick(CurrentSimTick);
                }


                if (_leftOverSnapshotMs > _msPerSnapshotTick)
                {
                    int snapshotPointer = WorldState.Instance.TakeSnapshot(CurrentSimTick);
                    _leftOverSnapshotMs = _leftOverSnapshotMs % _msPerSnapshotTick;

                    RefreshAllPlayers(snapshotPointer);
                }




                var deltaTime = (int)_stopwatch.ElapsedMilliseconds;
                

                _leftOverSnapshotMs += deltaTime;
                _leftOverSimMs += deltaTime;
                _stopwatch.Restart();
                await Task.Delay(10);
                //Thread.Sleep(5);
            }
            
        }

        public void RefreshAllPlayers(int snapshotPointer)
        {
            var tasks = new List<Task>();
            //List<KeyValuePair<Player, byte[]>> listOfUpdates = new List<KeyValuePair<Player, byte[]>>();
            if (PlayerManager.Instance.Players.Count==0) return;
            foreach (var player in PlayerManager.Instance.Players)
            {
                if(player.CurrentCell==null)continue;
                if (player.Socket != null &&player.Socket.State == WebSocketState.Open)
                    tasks.Add(Task.Factory.StartNew(() =>
                        player.Socket.SendData(
                            Encoding.UTF8.GetBytes("{\"tick\":"+WorldState.Instance.SnapshotTickTracker[snapshotPointer]+",\"Cells\":"+player.CurrentCell.GetAdjacentCells(snapshotPointer)+"}"))));
                else
                {
                    //AddEvent(() =>PlayerManager.Instance.Players.Remove(player));
                    player.Socket = null;
                }
            }

        }
    }
}