package lk.ourgym.repository;

import lk.ourgym.model.Batch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface BatchRepository extends JpaRepository<Batch, Long> {
    
    @Query("SELECT b FROM Batch b WHERE b.deleteddatetime IS NULL")
    List<Batch> getActiveBatches();
    
    @Query("SELECT b FROM Batch b WHERE b.deleteddatetime IS NULL AND b.status = true")
    List<Batch> getActiveAndEnabledBatches();
    
    @Query("SELECT b FROM Batch b WHERE b.deleteddatetime IS NULL AND b.name = :name")
    Batch getByName(@Param("name") String name);
}
