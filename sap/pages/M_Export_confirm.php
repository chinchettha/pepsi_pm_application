<?php
$title_page = "Export Confirm";
$tbl_policy = "view_exportconfirm";

?>

                    <div class="container-fluid">
                        <h1 class="mt-4"><?php echo $title_page;?></h1>
                       
                        <div class="card mb-12">
                            <div class="card-header">
                            <i class="fas fa-table mr-1"></i><?php echo $title_page;?>  &nbsp; / &nbsp;   
                           <a href="pages/M_Export_confirm_excel.php" target="_blank" class="btn btn-info" >  <i class="fas fa-table mr-1"></i> Export To Excel</a>
								
							</div>
                            <div class="card-body">
                                <div class="table-responsive">
                                    <table class="table table-bordered table-hover" id="dataTable" width="100%" cellspacing="0" data-page-length='50'>
                                        <thead class="thead-dark">
                                            <tr>
                                                <th>Order</th>
                                                <th>Operation</th>
                                                <th>Wrk Ctr</th>                                                
                                                <th>Act.Work</th> 
                                                <th>unit</th> 
                                                <th>Start date Exe.</th> 
                                                <th>End Daate Exe.</th> 
                                                <th>Start Execute</th>                                                
                                                <th>End Execute</th>          
                                            </tr>
                                        </thead>
                                        <tfoot class="thead-dark">
                                            <tr>
                                                <th>Order</th>
                                                <th>Operation</th>
                                                <th>Wrk Ctr</th>                                                
                                                <th>Act.Work</th> 
                                                <th>unit</th> 
                                                <th>Start date Exe.</th> 
                                                <th>End Daate Exe.</th> 
                                                <th>Start Execute</th>                                                
                                                <th>End Execute</th>  
                                            </tr>
                                        </tfoot>
                                        <tbody>
<?php
// ******************* Update 28/29/63 ******************
if($_SESSION["wkctr"] == 'PAC007' || $_SESSION["wkctr"] == "PRO005"  ){ // ให้ user 80004584 กับ user 40220658 Exoprt ได้ทุกใบ
    $strSQL = "SELECT * FROM $tbl_policy where ( syst='CRTD' or syst='REL')  order by timeclose DESC ";
}else{
    $strSQL = "SELECT * FROM $tbl_policy where ( syst='CRTD' or syst='REL') and cwkctr='$_SESSION[wkctr]'  order by timeclose DESC ";
} // ให้ user 80004584 กับ user 40220658 Exoprt ได้ทุกใบ
// ******************* Update 28/29/63 ******************
//echo $strSQL;
$query = mysqli_query($link, $strSQL);

while($result = mysqli_fetch_array($query))
{
?>
    <tr>
        <td><?PHP echo $result["wkorder"]; ?></td>
        <td><?PHP echo $result["opac"]; ?></td>
        <td><?PHP echo  $result["wkctr"]; ?></td>                                                
        <td><?PHP echo $result["timewk"]; ?></td> 
        <td><?PHP echo $result["unitc"]; ?></td> 
        <td><?PHP echo date('dmY', $result["stdate"])  ; ?></td> 
        <td><?PHP echo date('dmY',$result["endate"] ) ; ?></td> 
        <td><?PHP echo date('H:i', $result["stdate"] ) ; ?></td>
        <td><?PHP echo date('H:i', $result["endate"] ) ; ?></td> 
    </tr>
<?php } ?>

                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>


