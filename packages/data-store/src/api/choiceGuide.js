export default {
  fetch: async function({ projectId, choiceGuideId }) {
    
  let url = `/api/project/${projectId}/choicesguide/${choiceGuideId}`;
  return this.fetch(url);
    
  }
}