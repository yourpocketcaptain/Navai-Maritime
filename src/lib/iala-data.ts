/**
 * IALA Maritime Buoyage System Data (Updated 2010 Regulations)
 * Defines attributes for Day (Color, Shape, Topmark) and Night (Light, Rhythm) 
 * for all categories of maritime aids to navigation.
 */

export type IalaRegion = 'A' | 'B';
export type MarkCategory = 'Lateral' | 'Cardinal' | 'Isolated Danger' | 'Safe Water' | 'Special' | 'Emergency Wreck' | 'Preferred Channel';
export type BuoyShape = 'Can' | 'Nun' | 'Pillar' | 'Spar' | 'Spherical';
export type TopmarkType = '2 Cones Up' | '2 Cones Down' | '2 Cones Point-to-Point' | '2 Cones Base-to-Base' | '2 Spheres' | '1 Sphere' | 'X' | 'Cross';
export type ColorPattern = 'Solid' | 'Horizontal' | 'Vertical' | 'Horizontal Band';
export type LightColor = 'White' | 'Red' | 'Green' | 'Yellow' | 'Blue' | 'Blue/Yellow';

export interface IalaMark {
    id: string;
    name: string;
    category: MarkCategory;
    region?: IalaRegion | 'Both';
    // Day Attributes
    day: {
        colors: string[];
        pattern: ColorPattern;
        shape: BuoyShape;
        topmark: TopmarkType | 'None';
    };
    // Night Attributes
    night: {
        lightColor: LightColor;
        rhythm: string;
        period: number; // seconds
        flashes: number[]; // sequence of flash lengths or counts
    };
    // Intelligence
    meaning: string;
    instruction: string;
    officialImage?: string;
}

export const IALA_MARKS: IalaMark[] = [
    // --- CARDINAL MARKS ---
    {
        id: 'cardinal-north',
        name: 'North Cardinal Mark',
        category: 'Cardinal',
        region: 'Both',
        day: { colors: ['Black', 'Yellow'], pattern: 'Horizontal', shape: 'Pillar', topmark: '2 Cones Up' },
        night: { lightColor: 'White', rhythm: 'Q or VQ (Continuous)', period: 0, flashes: [1] },
        meaning: 'Safe water lies to the North of this mark. Danger lies to the South.',
        instruction: 'PASS TO THE NORTH.',
        officialImage: '/images/iala/cardinal-marks.png'
    },
    {
        id: 'cardinal-east',
        name: 'East Cardinal Mark',
        category: 'Cardinal',
        region: 'Both',
        day: { colors: ['Black', 'Yellow', 'Black'], pattern: 'Horizontal', shape: 'Pillar', topmark: '2 Cones Base-to-Base' },
        night: { lightColor: 'White', rhythm: 'Q(3)', period: 10, flashes: [3] },
        meaning: 'Safe water lies to the East of this mark. Danger lies to the West.',
        instruction: 'PASS TO THE EAST.',
        officialImage: '/images/iala/cardinal-marks.png'
    },
    {
        id: 'cardinal-west',
        name: 'West Cardinal Mark',
        category: 'Cardinal',
        region: 'Both',
        day: { colors: ['Yellow', 'Black', 'Yellow'], pattern: 'Horizontal', shape: 'Pillar', topmark: '2 Cones Point-to-Point' },
        night: { lightColor: 'White', rhythm: 'Q(9)', period: 15, flashes: [9] },
        meaning: 'Safe water lies to the West of this mark. Danger lies to the East.',
        instruction: 'PASS TO THE WEST.',
        officialImage: '/images/iala/cardinal-marks.png'
    },

    // --- LATERAL MARKS (Region A) ---
    {
        id: 'lateral-port-a',
        name: 'Port Hand Mark (Reg A)',
        category: 'Lateral',
        region: 'A',
        day: { colors: ['Red'], pattern: 'Solid', shape: 'Can', topmark: 'None' },
        night: { lightColor: 'Red', rhythm: 'Any except Gp(2+1)', period: 4, flashes: [1] },
        meaning: 'Marks the port (left) side of the channel when entering from sea.',
        instruction: 'LEAVE TO PORT.',
        officialImage: '/images/iala/lateral-a.png'
    },
    {
        id: 'lateral-starboard-a',
        name: 'Starboard Hand Mark (Reg A)',
        category: 'Lateral',
        region: 'A',
        day: { colors: ['Green'], pattern: 'Solid', shape: 'Nun', topmark: 'None' },
        night: { lightColor: 'Green', rhythm: 'Any except Gp(2+1)', period: 4, flashes: [1] },
        meaning: 'Marks the starboard (right) side of the channel when entering from sea.',
        instruction: 'LEAVE TO STARBOARD.',
        officialImage: '/images/iala/lateral-a.png'
    },
    {
        id: 'preferred-stbd-a',
        name: 'Preferred Channel to Starboard (Reg A)',
        category: 'Preferred Channel',
        region: 'A',
        day: { colors: ['Red', 'Green', 'Red'], pattern: 'Horizontal Band', shape: 'Can', topmark: 'None' },
        night: { lightColor: 'Red', rhythm: 'Gp(2+1)', period: 10, flashes: [2, 1] },
        meaning: 'Bifurcation. The main channel is to Starboard (Right).',
        instruction: 'MAIN CHANNEL TO STARBOARD.',
        officialImage: '/images/iala/preferred-a.png'
    },
    {
        id: 'preferred-port-a',
        name: 'Preferred Channel to Port (Reg A)',
        category: 'Preferred Channel',
        region: 'A',
        day: { colors: ['Green', 'Red', 'Green'], pattern: 'Horizontal Band', shape: 'Nun', topmark: 'None' },
        night: { lightColor: 'Green', rhythm: 'Gp(2+1)', period: 10, flashes: [2, 1] },
        meaning: 'Bifurcation. The main channel is to Port (Left).',
        instruction: 'MAIN CHANNEL TO PORT.',
        officialImage: '/images/iala/preferred-a.png'
    },
    // --- LATERAL MARKS (Region B) ---
    {
        id: 'lateral-port-b',
        name: 'Port Hand Mark (Reg B)',
        category: 'Lateral',
        region: 'B',
        day: { colors: ['Green'], pattern: 'Solid', shape: 'Can', topmark: 'None' },
        night: { lightColor: 'Green', rhythm: 'Any except Gp(2+1)', period: 4, flashes: [1] },
        meaning: 'Marks the port (left) side of the channel when entering from sea.',
        instruction: 'LEAVE TO PORT (RED RIGHT RETURNING RULE IN REVERSE).',
        officialImage: '/images/iala/lateral-b.png'
    },
    {
        id: 'lateral-starboard-b',
        name: 'Starboard Hand Mark (Reg B)',
        category: 'Lateral',
        region: 'B',
        day: { colors: ['Red'], pattern: 'Solid', shape: 'Nun', topmark: 'None' },
        night: { lightColor: 'Red', rhythm: 'Any except Gp(2+1)', period: 4, flashes: [1] },
        meaning: 'Marks the starboard (right) side of the channel when entering from sea.',
        instruction: 'LEAVE TO STARBOARD (RED RIGHT RETURNING).',
        officialImage: '/images/iala/lateral-b.png'
    },
    {
        id: 'preferred-stbd-b',
        name: 'Preferred Channel to Starboard (Reg B)',
        category: 'Preferred Channel',
        region: 'B',
        day: { colors: ['Green', 'Red', 'Green'], pattern: 'Horizontal Band', shape: 'Can', topmark: 'None' },
        night: { lightColor: 'Green', rhythm: 'Gp(2+1)', period: 10, flashes: [2, 1] },
        meaning: 'Bifurcation. The main channel is to Starboard (Right).',
        instruction: 'MAIN CHANNEL TO STARBOARD.',
        officialImage: '/images/iala/preferred-b.png'
    },
    {
        id: 'preferred-port-b',
        name: 'Preferred Channel to Port (Reg B)',
        category: 'Preferred Channel',
        region: 'B',
        day: { colors: ['Red', 'Green', 'Red'], pattern: 'Horizontal Band', shape: 'Nun', topmark: 'None' },
        night: { lightColor: 'Red', rhythm: 'Gp(2+1)', period: 10, flashes: [2, 1] },
        meaning: 'Bifurcation. The main channel is to Port (Left).',
        instruction: 'MAIN CHANNEL TO PORT.',
        officialImage: '/images/iala/preferred-b.png'
    },

    // --- OTHER MARKS ---
    {
        id: 'isolated-danger',
        name: 'Isolated Danger Mark',
        category: 'Isolated Danger',
        region: 'Both',
        day: { colors: ['Black', 'Red'], pattern: 'Horizontal', shape: 'Pillar', topmark: '2 Spheres' },
        night: { lightColor: 'White', rhythm: 'Fl(2)', period: 5, flashes: [2] },
        meaning: 'Stationary danger with navigable water all around.',
        instruction: 'PASS CLEAR OF THE MARK ON EITHER SIDE.',
        officialImage: '/images/iala/isolated-danger.png'
    },
    {
        id: 'safe-water',
        name: 'Safe Water Mark (Sea Buoy)',
        category: 'Safe Water',
        region: 'Both',
        day: { colors: ['White', 'Red'], pattern: 'Vertical', shape: 'Spherical', topmark: '1 Sphere' },
        night: { lightColor: 'White', rhythm: 'Iso, Oc, LFl 10s or Mo(A)', period: 10, flashes: [1] },
        meaning: 'Navigable water all around. Marks channel axis or center line.',
        instruction: 'PASS CLEAR OF THE MARK ON EITHER SIDE.',
        officialImage: '/images/iala/safe-water.png'
    },
    {
        id: 'special-mark',
        name: 'Special Mark',
        category: 'Special',
        region: 'Both',
        day: { colors: ['Yellow'], pattern: 'Solid', shape: 'Pillar', topmark: 'X' },
        night: { lightColor: 'Yellow', rhythm: 'Any except navigational', period: 5, flashes: [1] },
        meaning: 'Indicates special areas (cables, pipelines, recreation).',
        instruction: 'REFER TO CHARTS OR LOCAL NOTICES TO MARINERS.',
        officialImage: '/images/iala/special-mark.png'
    },
    {
        id: 'emergency-wreck',
        name: 'Emergency Wreck Mark',
        category: 'Emergency Wreck',
        region: 'Both',
        day: { colors: ['Blue', 'Yellow'], pattern: 'Vertical', shape: 'Pillar', topmark: 'Cross' },
        night: { lightColor: 'Blue/Yellow', rhythm: 'Alt Oc Bu Y', period: 3, flashes: [1, 1] },
        meaning: 'Newly discovered wreck not yet on charts.',
        instruction: 'PASS CLEAR OF THE MARK ON EITHER SIDE. DANGER IS NEW AND NOT YET ON CHARTS.',
        officialImage: '/images/iala/emergency-wreck.png'
    }
];
