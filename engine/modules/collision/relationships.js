import CollisionTypes from "./collision-types.js";

const None = CollisionTypes.None;
const Default = CollisionTypes.Default;
const Trigger = CollisionTypes.Trigger;
const Avatar = CollisionTypes.Avatar
const Projectile = CollisionTypes.Projectile;
const LivingTrigger = CollisionTypes.LivingTrigger;

const getRelations = (...types) => {
    const relationship = {};
    types.forEach(type=>relationship[type]=true);
    return Object.freeze(relationship);
};

const noRelations = () => new Object();

const Relationships = Object.freeze({
    [None]: noRelations(),
    [Trigger]: noRelations(),
    [Default]: getRelations(Default,Avatar),
    [Avatar]: getRelations(Default,Avatar,Trigger,LivingTrigger),
    [Projectile]: getRelations(Avatar),
    [LivingTrigger]: getRelations(Avatar)
});

export default Relationships;
