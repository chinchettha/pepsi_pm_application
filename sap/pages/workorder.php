<?php
$title_page = "Work Order";
$tbl_policy = "view_order";
$module = "workorder";

include_once("pages/M_filter_iw37.php");

?>

                            <div class="card-body">
                                <div class="table-responsive">
                                    <table class="table table-bordered table-hover table-desc7" id="dataTable" width="100%" cellspacing="0" data-page-length='50'>
                                        <thead class="thead-dark">
                                            <tr>
                                                <th>Work Order</th>
                                                <th>Manintenance plan</th>
                                                <th>Type</th>                                                
                                                <th>Equipment</th> 
                                                <th>Functional</th> 
                                                <th>Work</th> 
                                                <th>Date</th>                                                
                                                <th width="70px" >Team</th>
                                            </tr>
                                        </thead>
                                        <tfoot class="thead-dark">
                                            <tr>
                                                <th>Work Order</th>
                                                <th>Manintenance plan</th>
                                                <th>Type</th>                                                
                                                <th>Equipment</th> 
                                                <th>Functional</th> 
                                                <th>Work</th> 
                                                <th>Date</th>                                              
                                                <th>Team</th>
                                            </tr>
                                        </tfoot>
                                        <tbody>
<?php

while($result = mysqli_fetch_array($query))
{

?>
    <tr>
        <td title="<?PHP  echo $result["operationshorttext"] ;?>" data-toggle="tooltip" data-html="true" ><button type="button" onclick="return ShowOrder('<?PHP echo $result['idiw37']; ?>')" class="btn btn-xs" style="background-color:<?PHP echo $result["wkstcolor"]; ?>"   >
        <?PHP echo $result["wkorder"]; ?></button></td>
        <td ><?PHP echo $result["mntplan"]; ?></td>
        <td  ><?PHP echo  $result["wktype"] . "/".  sprintf("%02d",  $result["mat"]);  ?></td>                                                
        <td><?PHP echo $result["equdescrip"]; ?></td> 
        <td><?PHP echo $result["funcdescrip"]; ?></td> 
        <td><?PHP echo  $result["work"] . " ". $result["untime"]  ; ?></td> 
        <td><?PHP
        // ****************  หาวันที่ ปิดงานจริง ***************
            if(!empty($result["actfinish"])){
                echo date("d.m.Y",$result["actfinish"]) ; 
            }else if(!empty($result["cday"])) {
                echo date("d.m.Y",$result["cday"]) ; 
            }else{
                echo date("d.m.Y",$result["bscstart"]) ; 
            }                 
        // ****************  หาวันที่ ปิดงานจริง ***************
        ?></td>
        <td> 
<?PHP  
//update 170963
if($result["team"] == "A"){
    $teamA = "checked";
    $teamB = "";
    $teamP = "";
}else if($result["team"] == "B") {
    $teamA = "";
    $teamB = "checked";
    $teamP = "";
}else if($result["team"] == "P") {
    $teamA = "";
    $teamB = "";
    $teamP = "checked";
}else{
    $teamA = "";
    $teamB = "";
    $teamP = "";
}
//update 170963
?>

  <div class="form-check-inline">
  <label class="form-check-label">
    <input type="radio" class="form-check-input" name="team_<?PHP echo $result["wkorder"]; ?>" id="team_<?PHP echo $result["wkorder"]; ?>" onclick="return SelectTeam(this.value,'<?PHP echo $result['idiw37']; ?>','<?PHP echo $TxtSearch ;?>');" value="A" <?PHP  echo $teamA ?> >Team A
  </label>
</div>
<div class="form-check-inline">
  <label class="form-check-label">
    <input type="radio" class="form-check-input" name="team_<?PHP echo $result["wkorder"]; ?>" id="team_<?PHP echo $result["wkorder"]; ?>" onclick="return SelectTeam(this.value,'<?PHP echo $result['idiw37']; ?>','<?PHP echo $TxtSearch ;?>');" value="B" <?PHP  echo $teamB ?> >Team B
  </label>
</div>
<!--- update 170963  -->
<div class="form-check-inline">
  <label class="form-check-label">
    <input type="radio" class="form-check-input" name="team_<?PHP echo $result["wkorder"]; ?>" id="team_<?PHP echo $result["wkorder"]; ?>" onclick="return SelectTeam(this.value,'<?PHP echo $result['idiw37']; ?>','<?PHP echo $TxtSearch ;?>');" value="P" <?PHP  echo $teamP ?> >Team P
  </label>
</div>
<!-- update 170963 -->

        </td>    
    </tr>
<?php } ?>

                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>


	
		<!--******************* Show Modal  Ajax ************************-->
		<div id='Modal_OrderDetail'>	</div>  
		<!--******************* Show Modal  Ajax ************************-->


<script>
function ShowOrder(id){
    //alert(id);
    var Events = [];
    Events[0] = id;
    Events[2] = "ShowTk";

					
		//alert('selected ' + Events[0] );
		//Send Ajax On Select Table
		$.ajax({
		url: 'modalPages/ModalOrderDetail.php',
		type: "POST",
		data: {Event:Events },
			success: function(rep) {
			$("#Modal_OrderDetail").html(rep);	
			$("#ModalOrderDetail").modal('show'); //Open Modal										
		}
	});		
	//Send Ajax On Select Table	
}
</script>

<!----------Select Team----------->
<script>
function SelectTeam(val,id,txtsql){
    //alert(txtsql);
    var Events = [];
    Events[0] = id;
    Events[1] = val;
    Events[2] = txtsql;
	
		//Send Ajax On Select Table
		$.ajax({
		url: 'modalPages/AddTeam.php',
		type: "POST",
		data: {Event:Events },
			success: function(rep) {
			$("#OrderDetail").html(rep);										
		}
	});		
	//Send Ajax On Select Table	
}

</script>

<!----------Select Team----------->

<!---------  เรียงลำดับ DataTable ----------->    
<script>
$(document).ready(function() {
    $('.table-desc7').dataTable({
    "order": [[ 6, "desc" ]]
    } );
    $('.table-desc8').dataTable({
    "order": [[ 8, "desc" ]]
    } );
} );
</script>
<!--------- ปิด เรียงลำดับ DataTable ----------->   

