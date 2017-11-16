using System;
using System.Collections.Generic;
using System.Linq;
using System.Numerics;
using System.Text;
using Newtonsoft.Json;

namespace Model.BackendModel
{
    public class GridCell
    {
        private Random _rand;
        /// <summary>
        /// coordinates of the cell within the grid
        /// </summary>
        public int X, Y;

        public float GlobalX, GlobalY;

        public List<Player> Players;

        public List<WorldEntity> Entities;

        [NonSerialized] public GridCell[] AdjacentCells;

        [NonSerialized] public GridCell LeftAdjCell, RightAdjCell, TopAdjCell, BottomAdjCell;

        [NonSerialized] public string[] Snapshots;

        [NonSerialized] public bool[] SnapshotHasChanges;




        public event EventHandler CellUpdated;

        public GridCell(int x, int y)
        {
            X = x;
            Y = y;

            var xOffset = GlobalConfigs.GridCellCountWidth * GlobalConfigs.GridCellWidth / 2;
            var yOffset = GlobalConfigs.GridCellCountHeight * GlobalConfigs.GridCellHeight / 2;

            GlobalX = x * GlobalConfigs.GridCellWidth - xOffset;
            GlobalY = y * GlobalConfigs.GridCellHeight - yOffset;

            _rand = new Random();
            Entities = new List<WorldEntity>();
            Players = new List<Player>();

            Snapshots = new string[20];
            SnapshotHasChanges = new bool[20];

        }



        public Vector2 GetRandomCoordinate()
        {
            return new Vector2((float)(_rand.NextDouble() * GlobalConfigs.GridCellWidth), (float)(_rand.NextDouble() * GlobalConfigs.GridCellHeight));
        }

        protected virtual void OnCellUpdated()
        {
            CellUpdated?.Invoke(this, EventArgs.Empty);
        }

        public void AddEntity(WorldEntity worldEntity)
        {
            if (worldEntity.GetType() == typeof(Player))
            {
                var playerEntity = (Player)worldEntity;
                Players.Add(playerEntity);
            }
            else
            {
                Entities.Add(worldEntity);
            }

            //worldEntity.MovedCells += WorldEntity_EntityLeftCell;
            worldEntity.EntityMoved += WorldEntity_EntityMoved;
            worldEntity.CurrentCell = this;
        }

        public void RemoveEntity(WorldEntity worldEntity)
        {
            if (worldEntity.GetType() == typeof(Player))
            {
                var playerEntity = (Player)worldEntity;
                Players.Remove(playerEntity);
            }
            else
            {
                Entities.Remove(worldEntity);
            }

            worldEntity.EntityMoved -= WorldEntity_EntityMoved;
        }

        private void WorldEntity_EntityMoved(object sender, EventArgs e)
        {
            OnCellUpdated();

        }

        /*private void WorldEntity_EntityLeftCell(object sender, EventArgs e)
        {
            var cellInfo = (CellMovementArgs) e;
            if (sender.GetType() == typeof(Player))
            {
                var playerEntity = (Player)sender;

                playerEntity.PlayerDisconnected -= PlayerEntity_PlayerDisconnected;
                playerEntity.MovedCells -= WorldEntity_EntityLeftCell;
                playerEntity.EntityMoved -= WorldEntity_EntityMoved;
                Players.Remove(playerEntity);

                playerEntity.PlayerDisconnected += cellInfo.NewCell.PlayerEntity_PlayerDisconnected;
                playerEntity.MovedCells += cellInfo.NewCell.WorldEntity_EntityLeftCell;
                playerEntity.EntityMoved += cellInfo.NewCell.WorldEntity_EntityMoved;
                cellInfo.NewCell.Players.Add(playerEntity);

            }
            else
            {
                var worldEntity = (WorldEntity)sender;
                worldEntity.MovedCells -= WorldEntity_EntityLeftCell;
                worldEntity.EntityMoved -= WorldEntity_EntityMoved;
                Entities.Remove(worldEntity);

                worldEntity.MovedCells += cellInfo.NewCell.WorldEntity_EntityLeftCell;
                worldEntity.EntityMoved += cellInfo.NewCell.WorldEntity_EntityMoved;
                cellInfo.NewCell.Entities.Add(worldEntity);

            }
        }*/


        public void TakeSnapshot(int snapshotPointer)
        {
            //TODO: There is a far more efficient method to do this... just let it slide for now

            string prevSnapShot = Snapshots[(snapshotPointer + Snapshots.Length - 1) % Snapshots.Length];
            string currentSnapshot = JsonConvert.SerializeObject(this);
            if (prevSnapShot == currentSnapshot)
            {
                SnapshotHasChanges[snapshotPointer] = false;
            }
            else
            {
                SnapshotHasChanges[snapshotPointer] = true;
            }

            Snapshots[snapshotPointer] = currentSnapshot;
        }

        public string GetAdjacentCells(int snapshotPointer)
        {
            StringBuilder retVal = new StringBuilder();
            retVal.Append('[');

            foreach (var cell in AdjacentCells)
            {
                retVal.Append(cell.SnapshotHasChanges[snapshotPointer] ? (cell.Snapshots[snapshotPointer] + ',') : "");
            }

            if (retVal.Length == 1) return "[]";
            var test = new Vector2(3,5);
            var test2 = new Vector2(3,5);
            var result = test*test2;

            retVal[retVal.Length - 1] = ']';

            return retVal.ToString();
        }
    }
}