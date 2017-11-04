using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Numerics;
using Backend.WorldGeneration;
using BusinessServices.NetworkModel;
using Model;
using Model.BackendModel;
using Model.NetworkModel;


namespace Backend
{
    [Serializable]
    public class WorldState
    {
        public const int GridXSize = 3;
        public const int GridYSize = 3;

        private Random _rand;

        public static WorldState Instance;

        public List<Player> PlayerList;

        public List<WorldEntity> WorldEntities;

        public List<Item> Items { get; set; }

        public GridCell[,] WorldGrid;

        public EntityGenerator Generator;
        public RockEntityGenerator RockGenerator;

        public event EventHandler WorldUpdated;

        public WorldState()
        {

            Instance = this;
            PlayerList = new List<Player>();
            Items = new List<Item>();
            WorldEntities = new List<WorldEntity>();
            Generator = new EntityGenerator(this);
            RockGenerator = new RockEntityGenerator(this);
            WorldGrid = new GridCell[GridXSize, GridYSize];
            _rand = new Random();

            

            //initialize all cells
            for (int i = 0; i < GridXSize; i++)
            {
                for (int n = 0; n < GridYSize; n++)
                {
                    WorldGrid[i,n] = new GridCell(i, n);
                    WorldGrid[i,n].CellUpdated += WorldState_CellUpdated;
                }
            }

            //specify neighbors
            for (int i = 0; i < GridXSize; i++)
            {
                for (int n = 0; n < GridYSize; n++)
                {
                    var adjCellList = new List<GridCell>();
                    //check adj cells
                    for (int x = i - 1; x < i + 2&&x< GridXSize; x++)
                    {
                        for (int y = n - 1; y < n + 2 && y < GridYSize; y++)
                        {
                            //only skip out of bounds cells, we want to include the cell itself as well
                            if (x<0||y<0)
                            continue;

                            adjCellList.Add(WorldGrid[x,y]);
                        }
                    }
                    WorldGrid[i,n].AdjacentCells = adjCellList.ToArray();
                }
            }



        }

        private void WorldState_CellUpdated(object sender, EventArgs e)
        {
            var cell = (GridCell) sender;
            var allAdjacentPlayers = new List<Player>();
            for (int i = 0; i < cell.AdjacentCells.Length; i++)
            {
                allAdjacentPlayers.AddRange(cell.AdjacentCells[i].Players);
            }

            OnWorldUpdated(allAdjacentPlayers);
        }

        public Player AddPlayer(PlayerHandshake info)
        {
            //make new player, put 'em in the middle of a random cell
            var newPlayer = new Player(info,
                //GetRandomGridCell(), 
                WorldGrid[0, 0],
                new Vector2(GlobalConfigs.GridCellWidth/2, GlobalConfigs.GridCellHeight/2));



            //spawn some more rocks as a result of a player joining
            //RockGenerator.CreateRandomRocks();

            //and a couple more in the same cell as the player
            //RockGenerator.CreateRandomRocks(newPlayer.CurrentCell);

            newPlayer.PlayerDisconnected += PlayerDisconnected;
            return newPlayer;
            // Thread t = new Thread(new ParameterizedThreadStart(async (p) => { await Echo((Player)p); }));
            //t.Start(newPlayer);

        }

        private void PlayerDisconnected(object sender, EventArgs e)
        {
            var disconnectedPlayer = (Player) sender;

            PlayerList.Remove(disconnectedPlayer);

        }

        public void AddItem(Item newItem)
        {
            Items.Add(newItem);
        }



        public GridCell GetRandomGridCell()
        {
            return WorldGrid[_rand.Next(GridXSize),_rand.Next(GridYSize)];
        }

        public static void ProcessAction(PlayerAction action)
        {
            switch (action.Type)
            {
                case PlayerActionType.Move:
                    action.Player.CurrentCell.MovePlayer(action.Player, action.Velocity);
                    break;
                case PlayerActionType.Punch:
                    break;
                case PlayerActionType.Throw:
                    break;
                default:
                    throw new ArgumentOutOfRangeException();
            }
        }


        protected virtual void OnWorldUpdated(List<Player> affectedPlayers)
        {
            WorldUpdated?.Invoke(affectedPlayers, EventArgs.Empty);
        }

        
    }

}
