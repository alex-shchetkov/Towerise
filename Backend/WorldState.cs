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

        private Random _rand;

        public static WorldState Instance;

        public List<Player> PlayerList;

        public List<WorldEntity> WorldEntities;

        public List<Item> Items { get; set; }

        public GridCell[,] WorldGrid;

        public EntityGenerator Generator;
        public RockEntityGenerator RockGenerator;

        public event EventHandler WorldUpdated;

        public int[] SnapshotTickTracker;
        
        public int CurrentSnapshotPtr = 0;
        public int CurrentTick = 0;
        
        public WorldState()
        {
            SnapshotTickTracker = new int[20];
            Instance = this;
            PlayerList = new List<Player>();
            Items = new List<Item>();
            WorldEntities = new List<WorldEntity>();
            Generator = new EntityGenerator(this);
            RockGenerator = new RockEntityGenerator(this);
            WorldGrid = new GridCell[GlobalConfigs.GridCellCountWidth, GlobalConfigs.GridCellCountHeight];
            _rand = new Random();

            

            //initialize all cells
            for (int i = 0; i < GlobalConfigs.GridCellCountWidth; i++)
            {
                for (int n = 0; n < GlobalConfigs.GridCellCountHeight; n++)
                {
                    WorldGrid[i,n] = new GridCell(i, n);
                    WorldGrid[i,n].CellUpdated += WorldState_CellUpdated;
                }
            }

            //specify neighbors
            for (int i = 0; i < GlobalConfigs.GridCellCountWidth; i++)
            {
                for (int n = 0; n < GlobalConfigs.GridCellCountHeight; n++)
                {
                    var adjCellList = new List<GridCell>();
                    //check adj cells
                    for (int x = i - 1; x < i + 2&&x< GlobalConfigs.GridCellCountWidth; x++)
                    {
                        for (int y = n - 1; y < n + 2 && y < GlobalConfigs.GridCellCountHeight; y++)
                        {
                            //only skip out of bounds cells, we want to include the cell itself as well
                            if (x<0||y<0)
                            continue;

                            adjCellList.Add(WorldGrid[x,y]);
                            if (x < i && y == n) WorldGrid[i, n].LeftAdjCell = WorldGrid[x, y];
                            if (x > i && y == n) WorldGrid[i, n].RightAdjCell = WorldGrid[x, y];
                            if (x == i && y < n) WorldGrid[i, n].TopAdjCell = WorldGrid[x, y];
                            if (x == i && y > n) WorldGrid[i, n].BottomAdjCell = WorldGrid[x, y];
                        }
                    }
                    WorldGrid[i,n].AdjacentCells = adjCellList.ToArray();
                }
            }



        }

        private void WorldState_CellUpdated(object sender, EventArgs e)
        {
            OnWorldUpdated((GridCell)sender);
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
            return WorldGrid[_rand.Next(GlobalConfigs.GridCellCountWidth),_rand.Next(GlobalConfigs.GridCellCountHeight)];
        }

        public void ProcessAction(PlayerAction action)
        {
            switch (action.Type)
            {
                case PlayerActionType.Move:
                    action.Player.Move(action.Direction);
                    break;
                case PlayerActionType.Punch:
                    break;
                case PlayerActionType.Throw:
                    break;
                default:
                    throw new ArgumentOutOfRangeException();
            }
        }


        protected virtual void OnWorldUpdated(GridCell updatedCell)
        {
            WorldUpdated?.Invoke(updatedCell, EventArgs.Empty);
        }


        public int TakeSnapshot(int snapshotTick)
        {
            var retVal = CurrentSnapshotPtr;

            SnapshotTickTracker[CurrentSnapshotPtr] = snapshotTick;

            for (int i = 0; i < WorldGrid.GetLength(0); i++)
            {
                for (int n = 0; n < WorldGrid.GetLength(1); n++)
                {
                    WorldGrid[i, n].TakeSnapshot(CurrentSnapshotPtr);
                }
            }

            CurrentSnapshotPtr = (CurrentSnapshotPtr + 1) % 20;

            return retVal;
        }
    }

}
