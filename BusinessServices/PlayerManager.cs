using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
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
        public EventManager _eventManager;

        private string[] _playerColors = new string[]
        {
            "blue",
            "red",
            "black",
            "purple"
        };
        public static PlayerManager Instance;


        public PlayerManager(EventManager eventManager)
        {
            Players = new List<Player>();
            _eventManager = eventManager;
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
            //RockGenerator.CreateRandomRocks(newPlayer.CurrentCell);
            Players.Add(newPlayer);

            //_eventManager.AddRefreshEvent( newPlayer.CurrentCell.AdjacentCells, GetPlayersInRadius(newPlayer.Coords) );
            //_eventManager.AddEvent(()=>Players.Add(newPlayer));
            return newPlayer;
        }

        public Player[] GetPlayersInRadius(Vector2 coords)
        {
            return Players.Where(p => Vector2.Distance(p.Coords, coords) < 300).ToArray();
        }

        public void ProcessPlayerAction(PlayerAction action)
        {
            switch (action.Type)
            {
                case PlayerActionType.Move:
                    MovePlayer(action.Player, action.Velocity);
                    break;
                case PlayerActionType.Punch:
                    break;
                case PlayerActionType.Throw:
                    break;
                default:
                    throw new ArgumentOutOfRangeException();
            }
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
                newCell.Players.Add(player);
                //_eventManager.AddRefreshEvent(oldCell.AdjacentCells.Union(newCell.AdjacentCells).ToArray(), GetPlayersInRadius(player.Coords));
            }
            else
            {
               // _eventManager.AddRefreshEvent(oldCell.AdjacentCells, GetPlayersInRadius(player.Coords));
            }
            
        }
    }
}