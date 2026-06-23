export const RECENT_VISIT_SECTIONS = ['TSG', 'PS', 'IMS', 'COLLECTOR']
export const ITINERARY_SECTIONS = ['TSR/ENGINEER', 'TSR/PS', 'TSR']

export const canViewRecentVisits = section => RECENT_VISIT_SECTIONS.includes(section)
export const shouldOpenItinerary = section => ITINERARY_SECTIONS.includes(section)
