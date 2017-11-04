using System;
using System.Collections.Generic;
using System.Linq;
using System.Numerics;

namespace Model.BackendModel
{
    public class GridCell
    {
        private Random _rand;
        /// <summary>
        /// coordinates of the cell within the grid
        /// </summary>
        public int X, Y;
        public List<WorldEntity> Entities;


        

        [NonSerialized]public GridCell[] AdjacentCells;



        public event EventHandler CellUpdated;

        public GridCell(int x, int y)
        {
            X = x;
            Y = y;
            _rand = new Random();
            Entities = new List<WorldEntity>();
        }



        public Vector2 GetRandomCoordinate()
        {
            return new Vector2((float) (_rand.NextDouble()*GlobalConfigs.GridCellWidth), (float) (_rand.NextDouble()*GlobalConfigs.GridCellHeight));
        }

        public void MovePlayer(Player player, Vector2 velocity)
        {
            player.Coords += velocity;


            OnCellUpdated();
        }

        protected virtual void OnCellUpdated()
        {
            CellUpdated?.Invoke(this, EventArgs.Empty);
        }
    }
}