// Public navigation path. Air Fryer belongs to the Kitchen bottom menu.
async function openModule(page,name){
 if(name==='Air Fryer'){
  await page.getByRole('tab',{name:/^(Kuchnia|Kitchen)$/}).click();
  await page.getByRole('navigation',{name:/^(Nawigacja Kuchnia|Kitchen navigation)$/}).getByRole('button',{name:'Air Fryer',exact:true}).click();
 }else await page.getByRole('tab',{name,exact:true}).click();
}
module.exports={openModule};
