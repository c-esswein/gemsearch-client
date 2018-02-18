
export const LAYOUT_CONFIG = {
    /** factor to scale item coordinates from api */
    scalingFac: 2000,

    /** number of segments for item circle */
    itemRadiusSegments: 64,

    /** scale fac for positions if a cluster is active */
    clusterScale: 3,

    /** maximum of items rendered in scene, old items are disposed when new ones are loaded */
    maxItemsInScene: 150,

    /** Number of items which should be loaded per query request. */
    itemsPerRequest: 30,
};
