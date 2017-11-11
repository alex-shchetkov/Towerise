using System;
using System.Numerics;

namespace Model.BackendModel
{
    [Serializable]
    public class WorldEntity: Entity
    {
        [NonSerialized]public GridCell CurrentCell;
        
        //public event EventHandler MovedCells;
        public event EventHandler EntityMoved;
        



        public WorldEntity(GridCell cell, Vector2 initialLocalCoords)
        {
            CurrentCell = cell;
            LocalCoords = initialLocalCoords;
            cell.AddEntity(this);
            Coords = new Vector2(cell.GlobalX+LocalCoords.X, cell.GlobalY+LocalCoords.Y);
        }

        private int[] _cellAdjMap = new[] {4, 8, 2, 5, -1, 6, 0, 3, -1, 7, 1};

        public void Move(Vector2 relativeMove)
        {
            LocalCoords += relativeMove;
            Coords += relativeMove;
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

            var moveBitarray = 0b0000
                               | (LocalCoords.X < 0 ? 0b1000 : 0)
                               | (LocalCoords.X > GlobalConfigs.GridCellWidth ? 0b0100 : 0)
                               | (LocalCoords.Y < 0 ? 0b0010 : 0)
                               | (LocalCoords.Y > GlobalConfigs.GridCellHeight ? 0b0001 : 0);
            if (moveBitarray > 0)
            {
                if (LocalCoords.X > GlobalConfigs.GridCellWidth)
                {
                    newCell = CurrentCell.RightAdjCell;
                }
                else if (LocalCoords.X < 0)
                {
                    newCell = CurrentCell.LeftAdjCell;
                }
                else if (LocalCoords.Y > GlobalConfigs.GridCellHeight)
                {
                    newCell = CurrentCell.BottomAdjCell;
                }
                else if (LocalCoords.Y < 0)
                {
                    newCell = CurrentCell.TopAdjCell;
                }

                OnLeftCell(CurrentCell, newCell);
                //return;
            }

            
            
            OnEntityMoved();


        }

        [NonSerialized] public Vector2 LocalCoords;

        public Vector2 Coords { get; set; }

        




        protected virtual void OnLeftCell(GridCell lastCell, GridCell newCell)
        {
            if (newCell == null)
            {
                return;
            }
            if (LocalCoords.X > GlobalConfigs.GridCellWidth || LocalCoords.Y > GlobalConfigs.GridCellHeight)
            {
                LocalCoords = new Vector2(LocalCoords.X % GlobalConfigs.GridCellWidth, LocalCoords.Y % GlobalConfigs.GridCellHeight);
            }

            if (LocalCoords.X < 0)
            {
                LocalCoords = new Vector2(LocalCoords.X + GlobalConfigs.GridCellWidth, LocalCoords.Y);
            }
            if (LocalCoords.Y < 0)
            {
                LocalCoords = new Vector2(LocalCoords.X, LocalCoords.Y + GlobalConfigs.GridCellHeight);
            }

            lastCell.RemoveEntity(this);
            newCell.AddEntity(this);


            //MovedCells?.Invoke(this, new CellMovementArgs(lastCell, newCell));
        }

        protected virtual void OnEntityMoved()
        {
            EntityMoved?.Invoke(this, EventArgs.Empty);
        }
    }
}