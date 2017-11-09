/**
 * MODULE DEFINITION
 * 
 * VARIABLE AVAILABLE:
 * iServer is the index of the hosts array.
 * n_req is the number of request.
 * sessionsLists is the array with have all session associated with the index associate.
 *  Each item is a JSON variable that have:
 *      - session: String that define the session id
 *      - index: Int that define the element from array.
 * 
 * exports.laodBalancer = function(){
 *      // Write the code of policy
 * }
 */


/**
 * This Module is a plug in that define 
 * the policy for load balancer.
 */

module.exports={
    loadBalancer: function(){
        if(iServer>=ports.length-1){
            iServer=0;
        }else{
            iServer++;
        }
        return iServer;
    }
}