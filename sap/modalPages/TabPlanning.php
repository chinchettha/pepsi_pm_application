<?PHP
		$sqlPL = "SELECT * FROM view_workcenter  order by wkctr ASC   ";
		$queryPL = mysqli_query($link, $sqlPL) or die ("Error Query [".$sqlPL."]");
?>

<div class="card-body">
		<!------- จ่ายงานแบบบุคคล ----------->
		<div class="alert alert-primary " style="text-align: center" > Planning Work </div>
		<div class="row">

<?php								
	while($rsPL = mysqli_fetch_array($queryPL)){											
	?>
    <div> 
    <p>  &nbsp;
    <button type="button" onclick="return AddPlan('<?PHP echo $idiw37; ?>','<?PHP echo $rsPL['wkctr']; ?>','Add','P') "  class="btn btn-info" >
    <?php echo $rsPL['wkctr'];?> <br>
    <?php echo $rsPL['titlewkctr'].$rsPL['namewkctr']." ".$rsPL['surnamewkctr'];?>
    </button>
    &nbsp; </p>
    </div> 

    <?PHP  } ?>

</div>

	<p></p>
	<!------- ปิด จ่ายงานแบบบุคคล ----------->
	<div class="alert alert-primary " style="text-align: center" > Planning GROUP </div>
	<!---------- จ่ายงานแบบ กลุ่ม  ----------->
	<div class="table-responsive">
		 <table class="table table-bordered table-hover" id="dataTableG" width="100%" cellspacing="0" data-page-length='3'>
                                        <thead class="thead-dark">
                                            <tr>
												<th>รหัสกลุ่ม</th>
                                                <th>ชื่อกลุ่ม</th>                                                                                
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                       
                                        <tbody>
										<?php		
										$sqlPG = "SELECT * FROM tbwkctrgroup  order by wkctrgroup ASC   ";
										$queryPG = mysqli_query($link, $sqlPG) or die ("Error Query [".$sqlPG."]");						
										while($rsPG = mysqli_fetch_array($queryPG))
										{											
										?>
                                            <tr>
										        <td><?php echo $rsPG['wkctrgroup'];?></td>
                                                <td><?php echo $rsPG['wkctrdescription'];?></td>                                              
                                                <td align="center">
													<button type="button"  onclick="return AddPlan('<?PHP echo $idiw37; ?>','<?PHP echo $rsPG['idwkctrgroup']; ?>','Add','G') "  class="btn btn-info" ><i class="fa fa-edit"></i> Add </a>  </button>
												
												</td>
                                            </tr>
										<?php } ?>

                                        </tbody>
									</table>
	</div>
	<!---------- ปิดจ่ายงานแบบ กลุ่ม  ----------->
</div>				


<!------------  Show tbplaningwork ------------->
<div class="alert alert-success" > ผู้รับผิดชอบรายบุคคล... </div>
<div id="AddPlan" ><?PHP include_once("ShowPlan.php");?></div>
<!------------ Close Show tbplaningwork ------------->




<!---------- Data Table----------->
<script>
	$(document).ready(function() {
    $('#dataTableA').DataTable({
		"lengthMenu": [ 5, 10 ]
	});
} );

$(document).ready(function() {
    $('#dataTableG').DataTable({
		"lengthMenu": [ 5, 10 ]
	});
} );

</script>
<!---------- Data Table----------->

<script>
function AddPlan(idiw37,wkctr,st,pwteam){
	var Events = [];
	Events[0] = idiw37;
	Events[1] = wkctr;
	Events[2] = st;
	Events[3] = pwteam;
//Send Ajax On Select Table
$.ajax({
	url: 'modalPages/AddPlan.php',
	type: "POST",
	data: {Event:Events },
	success: function(rep) {
		$("#AddPlan").html(rep); //	Show in <Div>
		//$("#ModalOrderDetail").modal('show'); //Open Modal										
	}
});		
//Send Ajax On Select Table	
}
</script>