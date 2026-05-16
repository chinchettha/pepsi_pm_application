<div class="table-responsive">
<?PHP

		$sqlPC = "SELECT * FROM  view_personelclose where idiw37= '$idiw37'  order by wkctr ";
        $queryPC = mysqli_query($link, $sqlPC) or die ("Error Query [".$sqlPC."]");
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
									while($rsPC = mysqli_fetch_array($queryPC))
										{											
										?>
                                            <tr>
										        <td><?php echo $rsPC['wkctr'];?></td>
                                                <td><span data-toggle="tooltip"  title="<?php echo $rsPC['titlewkctreng'].$rsPC['namewkctreng']." ".$rsPC['surnamewkctreng'];?>"><?php echo $rsPC['titlewkctr'].$rsPC['namewkctr']." ".$rsPC['surnamewkctr'];?></span></td>
                                                <td style="text-align: center"> <?php echo date("d.m.Y H:i" , $rsPC['cstdate'] ) ;?></td>
                                                <td style="text-align: center"><?php echo  date("d.m.Y H:i" , $rsPC['cendate'] ) ;?></td>  
                                                <td style="text-align: center" ><?php echo $rsPC['wktimewk'];?> <?php echo $rsPC['wkunit'];?> </td>                                              
                                                <td align="center">
                                                    <button type="button"  onclick="return AddClose('<?PHP echo  $idiw37;?>','<?php echo $rsPC['wkctr'];?>','<?php echo date('d.m.Y' , $rsPC['cstdate'] ) ;?>','<?php echo date('H:i' , $rsPC['cstdate'] ) ;?>','<?php echo date('d.m.Y' , $rsPC['cendate'] ) ;?>','<?php echo date('H:i' , $rsPC['cendate'] ) ;?>','Add','#AddClose') "  class="btn btn-info" ><i class="fa fa-edit"></i> Confirm </a>  </button>
                                                    <button type="button"  onclick="return AddClose('<?PHP echo  $idiw37?>','<?php echo $rsPC['wkctr'];?>',startD.value,startT.value,endD.value,endT.value,'Add','#AddClose') "    class="btn btn-warning" ><i class="fa fa-edit"></i> Edit </a>  </button>
                                                    <button type="button"  onclick=" if(confirm('Confirm Delete?')==true){ return AddClose(<?PHP echo $idiw37;?>,<?PHP echo $rsPC['idwrkclose'];?>,'1','1','1','1','Del_Work','#PersonelClose') }"  class="btn btn-danger" ><i class="fa fa-trash"></i> Del </a>  </button>
												</td>
                                            </tr>
										<?php } ?>

                                        </tbody>
									</table>
	</div>