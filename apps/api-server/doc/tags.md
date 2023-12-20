## Tags

Tags are used for categorizing resources.

Tags belong to a project. An resource can have multiple tags. Tags can be grouped by their type. Tags have sequence numbers for ordening them in lists.

#### List all tags for a project
```
GET :HOSTNAME/api/project/:PROJECT_ID/tag
```
Or by type
```
GET :HOSTNAME/api/project/:PROJECT_ID/tag?type=theme
```
---
### Resources and tags

Tags can be used to group resources by a common descriptor. Obvious examples are themes or areas, but any other type is possible.

Grouping resources like this has two main goals: presenting filtered lists of resources, and the application of certain voting methods.

More about voting in the [voting docs](./voting.md) (yet to be written).

#### To list all resources, with their tags
```
GET :HOSTNAME/api/project/:PROJECT_ID/resource?includeTags=true
```

#### List resources filtered by tag(s)
```
GET :HOSTNAME/api/project/:PROJECT_ID/resource?tags=:TAG_ID1&tags=:TAG_ID2
```

#### Update tags on an resource
```
PUT :HOSTNAME/api/project/:PROJECT_ID/resource/:RESOURCE_ID
Content-Type: application/json
Authorization: XXX

{
  "tags": [:TAG_ID1, :TAG_ID2]
}
```
---

### Tag administration

#### List tags by type
Ordered by seqnr.
```
GET :HOSTNAME/api/project/:PROJECT_ID/tag?type=:TYPE
```

#### Create a tag
```
POST :HOSTNAME/api/project/:PROJECT_ID/tag
Content-Type: application/json
Authorization: XXX

{
  "name": "A new theme",
  "type": "theme",
  "seqnr": 10
}
```

#### Edit a tag
```
PUT :HOSTNAME/api/project/:PROJECT_ID/tag/1
Content-Type: application/json
Authorization: XXX

{
  "name": "An updated theme",
  "type": "theme",
  "seqnr": 40
}
```

#### Delete an tag
````
DELETE :HOSTNAME/api/project/:PROJECT_ID/tag/7
Authorization: XXX
````




# ToDo
- ik denk dat sommige tags exclusief zouden moeten zijn: een plan maar 1 thema kunnen hangen bijvoorbeeld
- missschien dat tags in tags mogelijk zou moeten zijn
