// One way
const asyncHandler = (requestHandler) => {
  return (request, response, next) => {
    Promise.resolve(requestHandler(request, response, next)).catch((error) => {
      next(error)
    })
  }
} 

// Second way
/*
const asyncHandler = () => {}
const asyncHandler = (fn) => {() => {}}
same as above 
const asyncHandler = (fn) => () => {}
easy way to write above one
const asyncHandler = (fn) => async () => { }


const asyncHandler = (fn) => async (reqest,response,next) =>{
  try {
    await fn(request,response,next)
  } catch (error) {
    response.status(error.code||500).json({
      success:false,
      message:error.message
    })
  }
}
  */
 
export {asyncHandler}