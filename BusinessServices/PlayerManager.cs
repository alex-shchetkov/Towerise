using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Net.WebSockets;
using System.Numerics;
using Backend;
using BusinessServices.NetworkModel;
using Model;
using Model.BackendModel;
using Model.NetworkModel;

namespace BusinessServices
{
    public class PlayerManager: Manager
    {
        public List<Player> Players;
        public List<Player> PlayerBots;
        public EventManager _eventManager;

        private Random _rand;

        public List<UserCommand> CommandQueue;

        private string[] _playerColors = new string[]
        {
            "blue",
            "red",
            "black",
            "purple",
            "cyan",
            "fuchsia",
            "magenta",
            "lime",
            "aqua",
            "white"
        };
        public static PlayerManager Instance;


        public PlayerManager(EventManager eventManager)
        {
            Players = new List<Player>();
            CommandQueue = new List<UserCommand>();
            _eventManager = eventManager;
            _rand = new Random();
            Instance = this;
        }

        public override void ProcessEvent(GameEvent cEvent)
        {
            base.ProcessEvent(cEvent);
            
        }

        public Player AddPlayer(PlayerHandshake info)
        {
            var newPlayer = new Player(info,
                WorldState.Instance.GetRandomGridCell(),
                //WorldGrid[0, 0],
                new Vector2(GlobalConfigs.GridCellWidth / 2, GlobalConfigs.GridCellHeight / 2),
                _playerColors[info.Name.Min() % _playerColors.Length]);

            //spawn some more rocks as a result of a player joining
            //RockGenerator.CreateRandomRocks();

            //and a couple more in the same cell as the player
            RockEntityManager.Instance.CreateRandomRocks(newPlayer.CurrentCell);
            Players.Add(newPlayer);
            Players.Add(new Player(null, WorldState.Instance.GetRandomGridCell(),new Vector2(50,50), _playerColors[_rand.Next(_playerColors.Length)]));

            //_eventManager.AddRefreshEvent( newPlayer.CurrentCell.AdjacentCells, GetPlayersInRadius(newPlayer.Coords) );
            //_eventManager.AddEvent(()=>Players.Add(newPlayer));
            return newPlayer;
        }

        public Player[] GetPlayersInRadius(Vector2 coords)
        {
            return Players.Where(p => Vector2.Distance(p.Coords, coords) < 300).ToArray();
        }

        public void ProcessUserCommand(UserCommand command)
        {
            var player = command.Player;

            
            if (player.PrevProcessedTick== 0)
            {
                player.PrevProcessedTick = command.Tick;
            }
/*
            if (player.IsMouseDown)
            {
                MovePlayer(player, player.Direction* (command.Tick - player.PrevProcessedTick));
                
            }*/

            if (command.Type == CommandType.MouseDown)
            {
                player.IsMouseDown = true;
            }
            else if (command.Type == CommandType.MouseUp)
            {
                player.IsMouseDown = false;
            }
            else if (command.Type == CommandType.Direction)
            {
                player.Direction = command.Direction;
            }

            player.PrevProcessedTick = command.Tick;
        }


        public void MovePlayer(Player player, Vector2 velocity)
        {

            player.LocalCoords += velocity;
            player.Coords += velocity;
            /*var moveBitarray = 0b0000
                               | (LocalCoords.X < 0 ? 0b1000 : 0)
                               | (LocalCoords.X > GlobalConfigs.GridCellWidth ? 0b0100 : 0)
                               | (LocalCoords.Y < 0 ? 0b0010 : 0)
                               | (LocalCoords.Y > GlobalConfigs.GridCellHeight ? 0b0001 : 0);

            GridCell newCell = null;
            if (moveBitarray > 0)
            {
                newCell = CurrentCell.AdjacentCells[_cellAdjMap[moveBitarray]];
            }*/

            GridCell newCell = null;
            GridCell oldCell = player.CurrentCell;
            if (oldCell == null) return;

            var moveBitarray = 0b0000
                               | (player.LocalCoords.X < 0 ? 0b1000 : 0)
                               | (player.LocalCoords.X > GlobalConfigs.GridCellWidth ? 0b0100 : 0)
                               | (player.LocalCoords.Y < 0 ? 0b0010 : 0)
                               | (player.LocalCoords.Y > GlobalConfigs.GridCellHeight ? 0b0001 : 0);
            if (moveBitarray > 0)
            {
                if (player.LocalCoords.X > GlobalConfigs.GridCellWidth)
                {
                    newCell = player.CurrentCell.RightAdjCell;
                    player.LocalCoords.X -= GlobalConfigs.GridCellWidth;
                }
                else if (player.LocalCoords.X < 0)
                {
                    newCell = player.CurrentCell.LeftAdjCell;
                    player.LocalCoords.X += GlobalConfigs.GridCellWidth;
                }
                else if (player.LocalCoords.Y > GlobalConfigs.GridCellHeight)
                {
                    newCell = player.CurrentCell.BottomAdjCell;
                    player.LocalCoords.Y -= GlobalConfigs.GridCellHeight;
                }
                else if (player.LocalCoords.Y < 0)
                {
                    newCell = player.CurrentCell.TopAdjCell;
                    player.LocalCoords.Y += GlobalConfigs.GridCellHeight;
                }
                player.CurrentCell = newCell;
                oldCell.Players.Remove(player);
                if(newCell!=null)
                    newCell.Players.Add(player);
                //_eventManager.AddRefreshEvent(oldCell.AdjacentCells.Union(newCell.AdjacentCells).ToArray(), GetPlayersInRadius(player.Coords));
            }
            else
            {
               // _eventManager.AddRefreshEvent(oldCell.AdjacentCells, GetPlayersInRadius(player.Coords));
            }
            
        }
        

        public void GameSimTick(int currentSimTick)
        {
            var botPlayers = Players.Where(p => p.Socket == null || p.Socket.State != WebSocketState.Open);
            foreach (var bot in botPlayers)
            {
                MovePlayer(bot, new Vector2(MathF.Sin(currentSimTick/10f), MathF.Cos(currentSimTick/10f))*5);
            }

            var sortedUserCommands = CommandQueue.OrderBy(c => c.Tick).ToArray();


            for (int i = 0; i < sortedUserCommands.Length; i++)
            {

                ProcessUserCommand(sortedUserCommands[i]);
                CommandQueue.Remove(sortedUserCommands[i]);
                /*if (sortedUserCommands[i].Tick < currentSimTick)
                {
                }*/
                
            }
            //CommandQueue.Clear();

            for (int i = 0; i < Players.Count; i++)
            {
                if ( Players[i].IsMouseDown)
                {
                    MovePlayer(Players[i], Players[i].Direction);
                    Players[i].PrevProcessedTick = _eventManager.CurrentSimTick;
                }
                
            }

        }

        public void AddCommandsToQueue(List<UserCommand> userCommands)
        {
            CommandQueue.AddRange(userCommands);

        }
    }
}