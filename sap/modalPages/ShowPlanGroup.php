<div class="table-responsive">
<?PHP

		$sqlPg = "SELECT * FROM  view_plangroup where idiw37= '$idiw37'  ";
		$queryPg = mysqli_query($link, $sqlPg) or die ("Error Query [".$sqlPg."]");
?>
		 <table class="table table-bordered table-hover" width="100%" cellspacing="0" data-page-length='5'>
                                        <thead class="thead-dark">
                                            <tr>
												<th>รหัสกลุ่ม</th>                                  
                                                <th>กลุ่มงาน</th>                                                                                
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                            
                                        <tbody>
										<?php								
										while($rsPg = mysqli_fetch_array($queryPg))
										{											
										?>
                                            <tr>
										        <td><?php echo $rsPg['wkctrgroup'];?></td>
                                                <td><?php echo $rsPg['wkctrdescription'];?></td>                                              
                                                <td align="center">
										<button type="button"  onclick=" if(confirm('Confirm Delete?')==true){ return AddPlan('<?PHP echo $idiw37; ?>','<?PHP echo $rsPg['idplanw']; ?>','Del') }"  class="btn btn-danger" ><i class="fa fa-trash"></i> Del </a>  </button>
												</td>
                                            </tr>
										<?php } ?>

                                        </tbody>
									</table>
    </div>
    
    