async function openModule(page,name){
 const nav=page.getByRole('navigation',{name:/^(Nawigacja główna|Main navigation)$/});
 const labels={Kuchnia:/^(Książka kucharska|Cookbook)$/,Kitchen:/^(Książka kucharska|Cookbook)$/,Zakupy:/^(Zakupy|Shopping)$/,Shopping:/^(Zakupy|Shopping)$/,Kawa:/^(Kawa|Coffee)$/,'Air Fryer':/^Air Fryer$/};
 await nav.getByRole('button',{name:labels[name]||name,exact:true}).click();
}
module.exports={openModule};
