using System;
using Model.BackendModel;

namespace Model
{
    public class CellMovementArgs: EventArgs
    {
        public CellMovementArgs(GridCell lastCell, GridCell newCell)
        {
            LastCell = lastCell;
            NewCell = newCell;
        }

        public GridCell LastCell { get; }
        public GridCell NewCell { get; }
    }
}