using System;
using System.Collections.Generic;
using System.Numerics;
using Backend;
using Model.BackendModel;

namespace BusinessServices
{
    public class RockEntityManager:Manager
    {
        private int _totalRockCount;
        private List<Rock> _rocks;

        private EventManager _eventManager;

        public static RockEntityManager Instance;

        public RockEntityManager(EventManager eventManager)
        {
            _totalRockCount = 0;
            _eventManager = eventManager;
            _rocks = new List<Rock>();
            Instance = this;
        }

        public void CreateRandomRocks()
        {
            //i dunno let's make 3 rocks
            for (int i = 0; i < 3; i++)
            {
                var randomCell = WorldState.Instance.GetRandomGridCell();
                Vector2 randomCoordinate = randomCell.GetRandomCoordinate();
                CreateRock(randomCell, randomCoordinate);
               
            }
        }

        /// <summary>
        /// Generate random rocks inside specified cell
        /// </summary>
        public void CreateRandomRocks(GridCell cell)
        {
            //i dunno let's make 2 rocks
            for (int i = 0; i < 2; i++)
            {
                Vector2 randomCoordinate = cell.GetRandomCoordinate();
                CreateRock(cell, randomCoordinate);
            }
        }


        private Rock CreateRock(GridCell cell, Vector2 coords)
        {
            _totalRockCount++;
            var newRock = new Rock(cell, coords);

            newRock.CurrentHp = 100;
            newRock.MaxHp = 100;
            newRock.Size = Vector2.One*10;

            _rocks.Add(newRock);

            cell.Entities.Add(newRock);
            Console.WriteLine($"Rock created in cell ({cell.X},{cell.Y})");
            return newRock;
        }

        private ThrowableRock CreateThrowableRock(GridCell cell, Vector2 coords)
        {
            var newRock = new ThrowableRock(cell, coords);

            return newRock;
        }

        private void NewRock_OnDestroyed(object sender, System.EventArgs e)
        {
            var destroyedRock = (Rock)sender;
            _totalRockCount--;

            CreateThrowableRock(destroyedRock.CurrentCell, destroyedRock.LocalCoords);

        }
    }
}