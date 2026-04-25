package lk.ourgym.controller;

import java.util.List;

/**
 * A shared interface that all CRUD controllers implement.
 * Ensures consistent method signatures across the application.
 *
 * @param <T> The entity type this controller manages (e.g. Employee, User)
 */
public interface CommonController<T> {

    /** Returns all records of this entity. */
    List<T> getAllData();

    /** Saves a new record. Returns "OK" on success, or an error message. */
    String getSaveData(T t);

    /** Updates an existing record. Returns "OK" on success, or an error message. */
    String getUpdateData(T t);

    /** Deletes a record. Returns "OK" on success, or an error message. */
    String getDeleteData(T t);
}
