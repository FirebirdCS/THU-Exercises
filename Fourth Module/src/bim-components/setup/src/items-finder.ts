import * as OBC from "@thatopen/components"

export const setupItemsFinder = (components: OBC.Components) => {
    const finder = components.get(OBC.ItemsFinder)

    finder.create("Walls", [{ categories: [/WALL/] }])
    finder.create("Doors & Windows", [{ categories: [/DOOR/, /WINDOW/] }])
    finder.create("Slabs", [{ categories: [/SLAB/] }])
    finder.create("Columns", [{ categories: [/COLUMN/] }])
    finder.create("Beams", [{ categories: [/BEAM/] }])
    finder.create("Roofs", [{ categories: [/ROOF/] }])
    finder.create("Stairs & Ramps", [{ categories: [/STAIR/, /RAMP/, /RAILING/] }])
    finder.create("Foundations", [{ categories: [/FOOTING/, /PILE/] }])
    finder.create("Curtain Walls", [{ categories: [/CURTAINWALL/, /MEMBER/, /PLATE/] }])
    finder.create("Coverings", [{ categories: [/COVERING/] }])
    finder.create("Spaces", [{ categories: [/SPACE/] }])
    finder.create("Furniture", [{ categories: [/FURNISHINGELEMENT/, /FURNITURE/] }])
    finder.create("Generic Elements", [{ categories: [/BUILDINGELEMENTPROXY/] }])

    finder.create("Pipes", [{ categories: [/PIPESEGMENT/, /PIPEFITTING/] }])
    finder.create("Ducts", [{ categories: [/DUCTSEGMENT/, /DUCTFITTING/] }])
    finder.create("Cable Carriers", [{ categories: [/CABLECARRIER/, /CABLESEGMENT/] }])
    finder.create("Plumbing Fixtures", [{ categories: [/SANITARYTERMINAL/, /WASTETERMINAL/] }])
    finder.create("Electrical Fixtures", [{ categories: [/LIGHTFIXTURE/, /ELECTRICAPPLIANCE/, /OUTLET/, /SWITCHINGDEVICE/] }])
    finder.create("Flow Terminals", [{ categories: [/FLOWTERMINAL/] }])

    finder.create("Drywall T7", [
        { attributes: {
            queries: [{
                name: /Name/ , value: /Muro liviano T7/
            }]
        }}
    ])

    finder.create("External Walls", [
        {
          categories: [/WALL/],
          relation: {
            name: "IsDefinedBy",
            query: {
              relation: {
                name: "HasProperties",
                query: {
                  attributes: {
                    queries: [
                      { name: /Name/, value: /IsExternal/ },
                      { name: /NominalValue/, value: true },
                    ]
                  }
                }
              }
            }
          }
        }
    ])

    finder.create("Internal Walls", [
        {
          categories: [/WALL/],
          relation: {
            name: "IsDefinedBy",
            query: {
              relation: {
                name: "HasProperties",
                query: {
                  attributes: {
                    queries: [
                      { name: /Name/, value: /IsExternal/ },
                      { name: /NominalValue/, value: false },
                    ]
                  }
                }
              }
            }
          }
        }
    ])

    finder.create("Load-Bearing Elements", [
        {
          relation: {
            name: "IsDefinedBy",
            query: {
              relation: {
                name: "HasProperties",
                query: {
                  attributes: {
                    queries: [
                      { name: /Name/, value: /LoadBearing/ },
                      { name: /NominalValue/, value: true },
                    ]
                  }
                }
              }
            }
          }
        }
    ])

    finder.create("Fire-Rated Elements", [
        {
          relation: {
            name: "IsDefinedBy",
            query: {
              relation: {
                name: "HasProperties",
                query: {
                  attributes: {
                    queries: [
                      { name: /Name/, value: /FireRating/ },
                    ]
                  }
                }
              }
            }
          }
        }
    ])
}
