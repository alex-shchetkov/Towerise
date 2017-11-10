using System.Numerics;
using Model.BackendModel;

namespace Backend.WorldGeneration
{
    public class RockEntityGenerator
    {
        private int _totalRockCount;
        private WorldState _world;

        public RockEntityGenerator(WorldState world)
        {
            _totalRockCount = 0;
            _world = world;
        }

        public void CreateRandomRocks()
        {
            //i dunno let's make 3 rocks
            for (int i = 0; i < 3; i++)
            {
                var randomCell = _world.GetRandomGridCell();
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

            newRock.OnDestroyed += NewRock_OnDestroyed;

            return newRock;
        }

        private ThrowableRock CreateThrowableRock(GridCell cell, Vector2 coords)
        {
            var newRock = new ThrowableRock(cell, coords);

            return newRock;
        }

        private void NewRock_OnDestroyed(object sender, System.EventArgs e)
        {
            var destroyedRock = (Rock) sender;
            _totalRockCount--;

            CreateThrowableRock(destroyedRock.CurrentCell, destroyedRock.LocalCoords);

        }
    }
}