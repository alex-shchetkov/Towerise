using System;
using System.Numerics;

namespace Model.BackendModel
{
    [Serializable]
    public class WorldEntity: Entity
    {
        public GridCell CurrentCell;


        public WorldEntity(GridCell cell, Vector2 initialCoords)
        {
            CurrentCell = cell;
            Coords = initialCoords;
        }

        public void Move(Vector2 relativeMove)
        {
            //Coords += relativeMove;
            
        }

        public Vector2 Coords { get; set; }
        

        //non-serializable
    }
}