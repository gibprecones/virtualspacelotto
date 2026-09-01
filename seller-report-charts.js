(()=>{
  function cleanupReports(){
    document.querySelectorAll('#reports .report-charts,#reports .report-chart-card,#reports .report-insights,#reports .insights,#reports .report-summary').forEach(node=>node.remove());
  }
  setInterval(cleanupReports,500);
  cleanupReports();
})();
