package lk.ourgym.repository;

import lk.ourgym.model.Class;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ClassRepository extends JpaRepository<Class, Long> {
    
    @Query("SELECT c FROM Class c WHERE c.deleteddatetime IS NULL")
    List<Class> getActiveClasses();
    
    @Query("SELECT c FROM Class c WHERE c.deleteddatetime IS NULL AND c.status = true")
    List<Class> getActiveAndEnabledClasses();
    
    @Query("SELECT c FROM Class c WHERE c.deleteddatetime IS NULL AND c.name = :name")
    Class getByName(@Param("name") String name);
}
