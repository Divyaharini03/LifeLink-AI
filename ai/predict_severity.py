import json
import sys
# Placeholder for ML model
# real implementation would load a pickle model trained on medical data

def predict_severity(symptoms):
    """
    Predicts emergency severity score (1-10) based on symptoms.
    """
    critical_keywords = ['chest pain', 'unconscious', 'bleeding', 'stroke', 'heart attack']
    high_keywords = ['broken', 'fever', 'burn', 'breathing']
    
    score = 0
    symptoms = symptoms.lower()
    
    for word in critical_keywords:
        if word in symptoms:
            score += 5
            
    for word in high_keywords:
        if word in symptoms:
            score += 2
            
    return min(10, max(1, score))

if __name__ == "__main__":
    if len(sys.argv) > 1:
        input_data = sys.argv[1]
        # In a real app, parse input_data
        print(json.dumps({"severity": predict_severity(input_data)}))
    else:
        print(json.dumps({"error": "No input provided"}))
