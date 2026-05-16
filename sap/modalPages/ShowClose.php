<div class="table-responsive">
<?PHP

		$sqlC = "SELECT * FROM  view_confirmation where idiw37= '$idiw37' order by wkctr asc ";
        $queryC = mysqli_query($link, $sqlC) or die ("Error Query [".$sqlC."]");
        //echo $sqlPs;
?>
		 <table class="table table-bordered table-hover" width="100%" cellspacing="0" data-page-length='5'>
                                        <thead class="thead-dark">
                                            <tr>
												<th>รหัสช่าง</th>
                                                <th>ชื่อ-สกุล</th>
                                                <th>วันเวลาเริ่ม</th>
                                                <th>วันเวลาสิ้นสุด</th>  
                                                <th>ระยะเวลา</th>                                               
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                            
                                        <tbody>
										<?php								
									while($rsC = mysqli_fetch_array($queryC))
										{											
										?>
                                            <tr>
										        <td><?php echo $rsC['wkctr'];?></td>
                                                <td><span data-toggle="tooltip"  title="<?php echo $rsC['titlewkctreng'].$rsC['namewkctreng']." ".$rsC['surnamewkctreng'];?>"><?php echo $rsC['titlewkctr'].$rsC['namewkctr']." ".$rsC['surnamewkctr'];?></span></td>
                                                <td><?php echo date("d.m.Y H:i" , $rsC['stdate'] ) ;?></td>
                                                <td><?php echo  date("d.m.Y H:i" , $rsC['endate'] ) ;?></td>  
                                                <td><?php echo $rsC['timewk'];?> <?php echo $rsC['unitc'];?> </td>                                              
                                                <td align="center">
										<button type="button"  onclick=" if(confirm('Confirm Delete?')==true){ return AddClose(<?PHP echo $rsC['idiw37'];?>,<?PHP echo $rsC['idclose'];?>,'1','1','1','1','Del','#AddClose') }"  class="btn btn-danger" ><i class="fa fa-trash"></i> Del </a>  </button>
												</td>
                                            </tr>
										<?php } ?>

                                        </tbody>
									</table>
	</div>