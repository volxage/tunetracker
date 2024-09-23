export default function dateDisplay(object: unknown): string{
//                    {((item.birth && item.birth !== null && item.birth.split) ? "B: " + item.birth.split("T")[0] : "B: none") + ", " + ((item.death && item.death !== null && item.death.split) ? "D: " + item.death.split("T")[0]  : "D: none")}
  if(object instanceof Date){
    // For some reason the month number for January in this system is 0...
    return `${object.getFullYear()}-${object.getMonth() + 1}-${object.getUTCDate()}`;
  }else if (!object){
    return "None";
  }else{
    return (object as string).split("T")[0];
  }
}
