let uniqueID = 1000;

const getUnique = () => uniqueID++;

const CollisionTypes = Object.freeze({
    Other: 0,
    Default: 1,

    Player: 2,
    Enemy: 3,

    PlayerProjectile: 4,
    EnemyProjectile: 5,

    getUnique: getUnique
});
export default CollisionTypes;
