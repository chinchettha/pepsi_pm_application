<div class="table-responsive">
<?PHP

		$sqlPs = "SELECT * FROM  view_planwork where idiw37= '$idiw37'  ";
		$queryPs = mysqli_query($link, $sqlPs) or die ("Error Query [".$sqlPs."]");
?>
		 <table class="table table-bordered table-hover" width="100%" cellspacing="0" data-page-length='5'>
                                        <thead class="thead-dark">
                                            <tr>
												<th>รหัสช่าง</th>
                                                <th>ชื่อ-สกุล</th>
                                                <th>กลุ่มงาน</th>
                                                <th>ตำแหน่ง</th>                                               
                                                
                                            </tr>
                                        </thead>
                            
                                        <tbody>
										<?php								
										while($rsPs = mysqli_fetch_array($queryPs))
										{											
										?>
                                            <tr>
										        <td><?php echo $rsPs['wkctr'];?></td>
                                                <td><span data-toggle="tooltip"  title="<?php echo $rsPs['titlewkctreng'].$rsPs['namewkctreng']." ".$rsPs['surnamewkctreng'];?>"><?php echo $rsPs['titlewkctr'].$rsPs['namewkctr']." ".$rsPs['surnamewkctr'];?></span></td>
                                                <td><?php echo $rsPs['wkctrtype'];?></td>
                                                <td><?php echo $rsPs['position'];?></td>                                              
                                                
                                            </tr>
										<?php } ?>

                                        </tbody>
									</table>
	</div>