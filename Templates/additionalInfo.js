function additionalInfoGenerator(notes, clientEvaluation, formData) {
  const info = `
    <div><b>Notes:</b><br/> 
${notes}
<br/>Risk Scorecard\n
<b>Transactional (Cash): </b>${formData.riskScoreData.transactional}
<b>Geographical Risk: </b>${formData.riskScoreData.geographical}
<b>Industry Risk: </b>${formData.riskScoreData.industry} 
<b>Client Risk: </b>${formData.riskScoreData.client}\n
<b>Risk Type:</b> ${formData.riskType}
<b>Client Evaluation:</b> 
How easy is to communicate with the client?: ${clientEvaluation["How easy is to communicate with the client?"]}
How Good is the client's Business?: ${clientEvaluation["How Good is the client's Business?"]}
Is the client interested in the services or just time waste?: ${clientEvaluation["Is the client interested in the services or just time waste?"]}

<b>Comments: </b>${clientEvaluation.clientComment} 
</div>
    `;

  return info;
}

module.exports = additionalInfoGenerator;
