export default function useChoiceGuides(props) {

    let self = this;
    
    const projectId = props.projectId;
    const choiceGuideId = props.choiceGuideId;
    
    const { data, error, isLoading } = self.useSWR({ projectId, choiceGuideId }, 'choiceGuide.fetch');
    
    let results = data || [];
    
    if (error) {
      let error = new Error(error);
      let event = new window.CustomEvent('osc-error', { detail: error });
      document.dispatchEvent(event);
    }
    
    return [ results, error, isLoading ]
  }