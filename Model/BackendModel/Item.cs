using System.Numerics;

namespace Model.BackendModel
{
    /// <summary>
    /// Item represents a pick-up-able thing. So it has 2 states, in the world, and in the inventory
    /// </summary>
    public class Item:WorldEntity
    {
        public Item(GridCell cell, Vector2 initialLocalCoords):base(cell, initialLocalCoords)
        {
            
        }
    }
}