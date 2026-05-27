import type { CurrentUser } from '@component-library/primitives'
import type {
  SignUpSheetData,
  SlotsOnlySheet,
  SortByDateSheet
} from '@component-library/sign-up-sheet'

export const currentUser: CurrentUser = {
  id: 'user-self',
  name: 'You'
}

export const sortByDateSheet: SortByDateSheet = {
  type: 'sort-by-date',
  title: 'Riverside Park Spring Cleanup',
  description:
    'Three Saturdays of volunteer trail repair. Sign up for any shift; bring gloves and water.',
  timeZone: 'EDT',
  slotGroups: [
    {
      id: 'sat-apr-12',
      label: 'Saturday, April 12',
      slots: [
        {
          id: 'apr-12-morning-trail',
          label: 'Trail clearing',
          description: 'North loop. Bring rakes if you have them.',
          capacity: 8,
          weekday: 'Saturday',
          date: 'Apr 12',
          time: '9:00 AM-11:00 AM',
          location: 'North Trailhead',
          participants: [
            { id: 'p-anna', name: 'Anna Reyes' },
            { id: 'p-ben', name: 'Ben Whitfield' },
            { id: 'p-cleo', name: 'Cleo Park' }
          ]
        },
        {
          id: 'apr-12-morning-pavilion',
          label: 'Pavilion painting',
          description: 'Two coats. Paint supplied; wear old clothes.',
          capacity: 4,
          weekday: 'Saturday',
          date: 'Apr 12',
          time: '9:00 AM-12:00 PM',
          location: 'East Pavilion',
          participants: [
            { id: 'p-dax', name: 'Dax Olufemi' },
            { id: 'p-omar', name: 'Omar Kessler' },
            { id: 'p-priya', name: 'Priya Ramanathan' },
            { id: 'p-quinn', name: 'Quinn Alvarez' }
          ]
        },
        {
          id: 'apr-12-afternoon-mulch',
          label: 'Mulching the playground',
          capacity: 6,
          weekday: 'Saturday',
          date: 'Apr 12',
          time: '1:00 PM-3:00 PM',
          location: 'Playground',
          participants: []
        },
        {
          id: 'apr-12-afternoon-checkin',
          label: 'Volunteer check-in table',
          description: 'Greet arrivals and hand out gloves and water.',
          capacity: 3,
          weekday: 'Saturday',
          date: 'Apr 12',
          time: '8:30 AM-12:30 PM',
          location: 'Main entrance',
          participants: [
            { id: 'p-rosa', name: 'Rosa Beaumont' },
            { id: 'p-sven', name: 'Sven Halvorsen' },
            { id: 'p-tova', name: 'Tova Lindqvist' }
          ]
        }
      ]
    },
    {
      id: 'sat-apr-19',
      label: 'Saturday, April 19',
      slots: [
        {
          id: 'apr-19-morning-litter',
          label: 'Litter sweep',
          capacity: 10,
          weekday: 'Saturday',
          date: 'Apr 19',
          time: '9:00 AM-11:00 AM',
          location: 'Main lawn',
          participants: [
            { id: 'p-elin', name: 'Elin Sato' },
            { id: 'p-fern', name: 'Fern Gallagher' },
            { id: 'p-greta', name: 'Greta Mahlangu' },
            { id: 'p-hugo', name: 'Hugo Park' },
            { id: 'p-iris', name: 'Iris Vandermeer' },
            { id: 'p-jules', name: 'Jules Tan' },
            { id: 'p-kim', name: 'Kim Ouellette' }
          ]
        },
        {
          id: 'apr-19-afternoon-flowers',
          label: 'Plant native wildflowers',
          description: 'Volunteer Master Gardener leads. Plants provided.',
          capacity: 5,
          weekday: 'Saturday',
          date: 'Apr 19',
          time: '1:00 PM-4:00 PM',
          location: 'South meadow',
          participants: [
            { id: 'p-lior', name: 'Lior Bensimon' },
            { id: 'p-mei', name: 'Mei Sato-Reyes' },
            { id: 'p-yara', name: 'Yara Okonkwo' },
            { id: 'p-zane', name: 'Zane Chen' }
          ]
        },
        {
          id: 'apr-19-afternoon-photo',
          label: 'Event photography',
          description: 'Capture before/after shots for the newsletter.',
          capacity: 2,
          weekday: 'Saturday',
          date: 'Apr 19',
          time: '10:00 AM-2:00 PM',
          location: 'Roaming',
          participants: []
        }
      ]
    },
    {
      id: 'sat-apr-26',
      label: 'Saturday, April 26',
      slots: [
        {
          id: 'apr-26-morning-build',
          label: 'Build raised garden beds',
          description: 'Power tools welcome. Lunch provided.',
          capacity: 6,
          weekday: 'Saturday',
          date: 'Apr 26',
          time: '9:00 AM-1:00 PM',
          location: 'Community garden',
          participants: [{ id: 'p-nik', name: 'Nik Petraitis' }]
        },
        {
          id: 'apr-26-afternoon-paint',
          label: 'Repaint trail markers',
          description: 'Touch up faded blazes along the loop.',
          capacity: 4,
          weekday: 'Saturday',
          date: 'Apr 26',
          time: '1:00 PM-4:00 PM',
          location: 'North loop',
          participants: [
            { id: 'p-ursa', name: 'Ursa Bjornsen' },
            { id: 'p-vance', name: 'Vance Okafor' },
            { id: 'p-wren', name: 'Wren Castillo' },
            { id: 'p-xan', name: 'Xan Petrov' }
          ]
        },
        {
          id: 'apr-26-afternoon-cleanup',
          label: 'Pack up and final sweep',
          capacity: 5,
          weekday: 'Saturday',
          date: 'Apr 26',
          time: '4:00 PM-5:30 PM',
          location: 'Community garden',
          participants: []
        }
      ]
    }
  ]
}

export const slotsOnlySheet: SlotsOnlySheet = {
  type: 'slots-only',
  title: 'Cleanup Day Supply Drive',
  description:
    'Sign up to bring something. Anything left over goes to the food bank.',
  slots: [
    {
      id: 'supply-water',
      label: 'Cases of water',
      description: '24-pack flats; chilled is bonus.',
      capacity: 10,
      participants: [
        { id: 'p-anna', name: 'Anna Reyes', quantity: 2 },
        { id: 'p-ben', name: 'Ben Whitfield' }
      ]
    },
    {
      id: 'supply-snacks',
      label: 'Granola bars',
      capacity: 4,
      participants: [{ id: 'p-cleo', name: 'Cleo Park', quantity: 3 }]
    },
    {
      id: 'supply-gloves',
      label: 'Work gloves (assorted sizes)',
      capacity: 6,
      participants: []
    },
    {
      id: 'supply-bags',
      label: 'Heavy-duty trash bags',
      capacity: 5,
      participants: [{ id: 'p-dax', name: 'Dax Olufemi', quantity: 2 }]
    },
    {
      id: 'supply-firstaid',
      label: 'First-aid kits',
      capacity: 2,
      participants: [
        { id: 'p-elin', name: 'Elin Sato' },
        { id: 'p-fern', name: 'Fern Gallagher' }
      ]
    },
    {
      id: 'supply-sunscreen',
      label: 'Sunscreen (SPF 30+)',
      description: 'Spray bottles preferred for easy sharing.',
      capacity: 3,
      participants: [
        { id: 'p-greta', name: 'Greta Mahlangu' },
        { id: 'p-hugo', name: 'Hugo Park' },
        { id: 'p-iris', name: 'Iris Vandermeer' }
      ]
    },
    {
      id: 'supply-coolers',
      label: 'Coolers with ice',
      description: 'For drinks at the rest station.',
      capacity: 4,
      participants: [{ id: 'p-jules', name: 'Jules Tan', quantity: 2 }]
    },
    {
      id: 'supply-papertowels',
      label: 'Paper towel rolls',
      capacity: 8,
      participants: [
        { id: 'p-kim', name: 'Kim Ouellette', quantity: 2 },
        { id: 'p-lior', name: 'Lior Bensimon' }
      ]
    },
    {
      id: 'supply-clipboards',
      label: 'Sharpies and clipboards',
      description: 'For check-in tables.',
      capacity: 2,
      participants: [
        { id: 'p-mei', name: 'Mei Sato-Reyes' },
        { id: 'p-nik', name: 'Nik Petraitis' }
      ]
    }
  ]
}

export const emptySheet: SortByDateSheet = {
  type: 'sort-by-date',
  title: 'Future cleanup',
  description: 'Dates to be announced.',
  slotGroups: []
}

export const groupWithNoSlotsSheet: SortByDateSheet = {
  type: 'sort-by-date',
  title: 'Pending sign-ups',
  description: 'Slots will be added once locations are confirmed.',
  slotGroups: [
    {
      id: 'sat-may-3',
      label: 'Saturday, May 3',
      slots: []
    }
  ]
}

export const overCapacitySheet: SlotsOnlySheet = {
  type: 'slots-only',
  title: 'Over-capacity demo',
  description:
    'This slot has more participants than capacity allows. Sign-up is disabled and a console.error fires in dev.',
  slots: [
    {
      id: 'over-1',
      label: 'Lost-and-found duty',
      description: 'Walk-up sign-up overflowed.',
      capacity: 2,
      participants: [
        { id: 'p-greta', name: 'Greta Mahlangu' },
        { id: 'p-hugo', name: 'Hugo Park' },
        { id: 'p-iris', name: 'Iris Vandermeer' }
      ]
    }
  ]
}

export const compoundDemoSheet: SignUpSheetData = {
  type: 'slots-only',
  title: 'Custom layout via compound API',
  description: 'This card composes the recipe components manually.',
  slots: [
    {
      id: 'compound-1',
      label: 'Volunteer greeter',
      capacity: 3,
      participants: [{ id: 'p-jules', name: 'Jules Tan' }]
    },
    {
      id: 'compound-2',
      label: 'Sign-in table',
      capacity: 2,
      participants: []
    }
  ]
}
