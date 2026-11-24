async function openModule(page,name){
 const nav=page.getByRole('navigation',{name:/^(Nawigacja główna|Main navigation)$/});
 const labels={Kuchnia:/^(Książka kucharska|Cookbook)$/,Kitchen:/^(Książka kucharska|Cookbook)$/,Zakupy:/^(Zakupy|Shopping)$/,Shopping:/^(Zakupy|Shopping)$/,Kawa:/^(Kawa|Coffee)$/,'Air Fryer':/^Air Fryer$/};
 if(name==='Zakupy'||name==='Shopping')await page.getByRole('navigation',{name:/^(Główne działy|Main sections)$/}).getByRole('button',{name:labels[name]}).click();
 else await nav.getByRole('button',{name:labels[name]||name,exact:true}).click();
}
module.exports={openModule};
