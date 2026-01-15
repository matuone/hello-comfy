// Test para ver los datos de filters
fetch("http://localhost:5000/api/products/filters/data")
  .then(res => res.json())
  .then(data => {
    console.log("CATEGORIAS:", data.categories);
    console.log("\nSUBCATEGORIAS AGRUPADAS:");
    Object.entries(data.groupedSubcategories).forEach(([cat, subs]) => {
      console.log(`\n${cat}:`, subs);
    });
  })
  .catch(err => console.error(err));
