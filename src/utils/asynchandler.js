
// this is a wrapper used to catch error in async handler and we use double header fns and there are complex to understand so if u 
// understand better use it or else manually catch error in async handler by writing try catch block for every route where it is easily undersatndable but the code is repetative


// const asynchandler=(fn)=>async(req,res,next)=>{
//     try{
//         await fn(req,res,next)
//     }
//     catch(error){
//         res.status(500).json({
//             success:false
//             ,error:error.message})
//     }

// }